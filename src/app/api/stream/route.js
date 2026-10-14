import LiveSession from "@/lib/models/LiveSession";
import ParentAction from "@/lib/models/ParentAction";
import Session from "@/lib/models/Session";
import { authErrorResponse, requireCaregiver, requireChild } from "@/lib/auth";
import { effectiveLiveStatus } from "@/lib/live";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PENDING_ACTION_WINDOW_MS = 60_000;

// Server-Sent Events, one connection per page:
//  ?role=child  → `parent-action` (stickers, speed, pause)
//  ?role=parent → `telemetry`, `snapshot` (camera frame, consent-gated), `refresh` (new session)
// Polls Mongo once per second; fine at demo scale on a long-lived Node server.
export async function GET(request) {
  const role = new URL(request.url).searchParams.get("role") === "child" ? "child" : "parent";
  let child;
  try {
    ({ child } = role === "child" ? await requireChild() : await requireCaregiver());
  } catch (err) {
    return authErrorResponse(err);
  }
  const childId = child._id;
  const framesAllowed = Boolean(child.consent?.camera && child.consent?.liveFrames);

  const encoder = new TextEncoder();
  let closed = false;
  let interval = null;

  const stream = new ReadableStream({
    async start(controller) {
      const write = (chunk) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const send = (event, data) => write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

      let lastSentKey = null;
      let lastSnapshotFrame = null;
      let lastSessionAt = 0;
      let lastActionId = null;

      const pushTelemetry = (live) => {
        const status = effectiveLiveStatus(live);
        const key = live ? `${new Date(live.updatedAt).getTime()}:${status}` : "none";
        if (key === lastSentKey) return;
        lastSentKey = key;
        const { snapshotFrame, ...rest } = live || {};
        send("telemetry", { ...rest, status, childName: child.name });
        if (framesAllowed && status !== "idle" && snapshotFrame && snapshotFrame !== lastSnapshotFrame) {
          lastSnapshotFrame = snapshotFrame;
          send("snapshot", { snapshotFrame });
        }
      };

      if (role === "parent") {
        pushTelemetry(await LiveSession.findOne({ childId }).lean());
        const latest = await Session.findOne({ childId }).sort({ createdAt: -1 }).select("createdAt").lean();
        if (latest) lastSessionAt = new Date(latest.createdAt).getTime();
      } else {
        const live = await LiveSession.findOne({ childId }).lean();
        send("parent-action", { actionType: "TOGGLE_PAUSE", payload: { paused: live?.status === "paused" } });
      }

      const tick = async () => {
        if (closed) return;
        try {
          if (role === "parent") {
            pushTelemetry(await LiveSession.findOne({ childId }).lean());
            const latest = await Session.findOne({ childId }).sort({ createdAt: -1 }).select("createdAt").lean();
            if (latest) {
              const ts = new Date(latest.createdAt).getTime();
              if (ts !== lastSessionAt) {
                lastSessionAt = ts;
                send("refresh", { sessionId: String(latest._id) });
              }
            }
            return;
          }

          // Child: unconsumed actions from the last minute (covers brief disconnects)
          const query = lastActionId
            ? { childId, _id: { $gt: lastActionId } }
            : { childId, consumedAt: null, createdAt: { $gte: new Date(Date.now() - PENDING_ACTION_WINDOW_MS) } };
          const actions = await ParentAction.find(query).sort({ _id: 1 }).limit(20).lean();
          for (const action of actions) {
            lastActionId = action._id;
            send("parent-action", { actionType: action.actionType, payload: action.payload });
          }
          if (actions.length) {
            await ParentAction.updateMany({ _id: { $in: actions.map((a) => a._id) } }, { consumedAt: new Date() });
          }
        } catch (err) {
          console.error("SSE tick error:", err.message);
        }
      };

      interval = setInterval(() => {
        tick();
        write(`: ping\n\n`);
      }, 1000);

      request.signal.addEventListener("abort", () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },

    cancel() {
      closed = true;
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
