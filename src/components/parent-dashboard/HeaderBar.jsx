"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useParentStore } from "../../stores/useParentStore";
import { PARENT_TABS } from "./nav";

const SEEN_KEY = "nb_notifications_seen_at";

function readSeen() {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function HeaderBar() {
  const { activeTab, notifications, child, lastUpdatedAt } = useParentStore();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef(null);
  const title = PARENT_TABS.find((t) => t.id === activeTab)?.label;
  const unread = notifications.filter((n) => new Date(n.at).getTime() > seenAt).length;

  useEffect(() => {
    const t = setTimeout(() => setSeenAt(readSeen()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    const now = Date.now();
    try {
      localStorage.setItem(SEEN_KEY, String(now));
    } catch {
      // storage unavailable — badge simply won't persist
    }
    setSeenAt(now);
  };

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm px-4 md:px-8 py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-nunito font-extrabold text-2xl text-ink truncate">{title}</h1>
        <p className="font-dm-sans text-[13px] text-muted">
          {child.name}
          {lastUpdatedAt && ` · updated ${new Date(lastUpdatedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`}
        </p>
      </div>
      <div className="relative" ref={ref}>
        <button onClick={toggle} aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} className="relative w-11 h-11 rounded-xl bg-white ring-1 ring-line flex items-center justify-center text-ink-soft hover:text-ink">
          <Bell size={19} />
          {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-coral-700 text-white font-dm-sans text-[11px] font-bold flex items-center justify-center tabular">{unread}</span>}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-[var(--shadow-raised)] p-2 z-40">
            {!notifications.length ? (
              <p className="font-dm-sans text-sm text-muted p-4 text-center">Nothing new this week.</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="px-3 py-2.5 rounded-xl hover:bg-canvas">
                    <p className="font-dm-sans text-sm text-ink">{n.text}</p>
                    <p className="font-dm-sans text-[12px] text-muted">{new Date(n.at).toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" })}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
