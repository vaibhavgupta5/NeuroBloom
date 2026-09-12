import { getConnection } from "@/lib/db";
import Child from "@/lib/models/Child";
import LiveSession from "@/lib/models/LiveSession";
import ParentAction from "@/lib/models/ParentAction";
import Session from "@/lib/models/Session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-Sent Events stream. Both dashboards subscribe to this single endpoint:
//  - parent listens for `telemetry` (live game updates, WITHOUT the camera
//    frame to keep events light), `snapshot` (camera frame, only when it
//    changed — every ~10s), and `refresh` (new session saved)
//  - child listens for `parent-action` (stickers, speed, pause)
// The loop polls Mongo once per second — fine for the single-family demo scale.
export async function GET(request) {
  await getConnection();

  const child = await Child.findOne().lean();
  if (!child) {
    return Response.json({ error: "No child found. Run: npm run seed" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, data) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const ping = () => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          closed = true;
        }
      };

      // Initial snapshot so subscribers paint immediately (telemetry without
      // the heavy frame; frame goes out as its own event right after)
      const initialLive = await LiveSession.findOne({ childId: child._id }).lean();
      const { snapshotFrame: initialSnapshot, ...initialRest } = initialLive || {};
      send("telemetry", { ...initialRest, childName: child.name });
      if (initialSnapshot) send("snapshot", { snapshotFrame: initialSnapshot });

      let lastUpdatedAt = initialLive ? new Date(initialLive.updatedAt).getTime() : 0;
      let lastSnapshotFrame = initialSnapshot || null;
      let lastSessionAt = 0;
      let lastActionId = null;

      // Skip actions created before this connection opened
      const preExisting = await ParentAction.findOne({ childId: child._id })
        .sort({ createdAt: -1 })
        .lean();
      if (preExisting) lastActionId = String(preExisting._id);

      const tick = async () => {
        if (closed) return;

        try {
          // 1) Live telemetry changes (frame stripped — sent as its own event)
          const live = await LiveSession.findOne({ childId: child._id }).lean();
          if (live) {
            const { snapshotFrame, ...rest } = live;
            const ts = new Date(live.updatedAt).getTime();
            if (ts !== lastUpdatedAt) {
              lastUpdatedAt = ts;
              send("telemetry", { ...rest, childName: child.name });
            }
            // Camera frame: pushed only when it actually changed (~every 10s)
            if (snapshotFrame && snapshotFrame !== lastSnapshotFrame) {
              lastSnapshotFrame = snapshotFrame;
              send("snapshot", { snapshotFrame });
            }
          }

          // 2) New parent actions → delivered to the child, then marked consumed
          const query = { childId: child._id };
          if (lastActionId) query._id = { $gt: lastActionId };
          const actions = await ParentAction.find(query).sort({ createdAt: 1 }).limit(20).lean();
          for (const action of actions) {
            lastActionId = String(action._id);
            send("parent-action", {
              actionType: action.actionType,
              payload: action.payload,
            });
            await ParentAction.updateOne({ _id: action._id }, { consumedAt: new Date() });
          }

          // 3) New sessions → tells the parent dashboard to refetch aggregates
          const latestSession = await Session.findOne({ childId: child._id })
            .sort({ createdAt: -1 })
            .lean();
          if (latestSession) {
            const ts = new Date(latestSession.createdAt).getTime();
            if (ts !== lastSessionAt) {
              if (lastSessionAt !== 0) send("refresh", { sessionId: String(latestSession._id) });
              lastSessionAt = ts;
            }
          }
        } catch (err) {
          console.error("SSE tick error:", err.message);
        }
      };

      const interval = setInterval(() => {
        if (closed) return;
        tick();
        ping();
      }, 1000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      closed = true;
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
