"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut, MoreHorizontal, X } from "lucide-react";
import { useParentStore } from "../../stores/useParentStore";
import { PARENT_TABS } from "./nav";
import { signOut } from "./Sidebar";
import { cn } from "../../lib/cn";

const PRIMARY = ["overview", "live", "progress", "wellbeing"];

export default function ParentMobileNav() {
  const router = useRouter();
  const { activeTab, setActiveTab, liveSession, child } = useParentStore();
  const [more, setMore] = useState(false);
  const secondary = PARENT_TABS.filter((t) => !PRIMARY.includes(t.id));
  const go = (id) => {
    setActiveTab(id);
    setMore(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line px-2 pb-[env(safe-area-inset-bottom)]" aria-label="Dashboard">
        <div className="grid grid-cols-5">
          {PARENT_TABS.filter((t) => PRIMARY.includes(t.id)).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} aria-current={activeTab === id ? "page" : undefined}
              className={cn("relative h-16 flex flex-col items-center justify-center gap-1 font-dm-sans text-[12px]", activeTab === id ? "text-teal-700 font-bold" : "text-muted")}>
              <Icon size={20} aria-hidden />
              {label}
              {id === "live" && liveSession.isLive && <span className="absolute top-3 right-[calc(50%-16px)] w-2 h-2 rounded-full bg-teal-600" aria-label="Live now" />}
            </button>
          ))}
          <button onClick={() => setMore(true)} aria-expanded={more}
            className={cn("h-16 flex flex-col items-center justify-center gap-1 font-dm-sans text-[12px]", secondary.some((t) => t.id === activeTab) ? "text-teal-700 font-bold" : "text-muted")}>
            <MoreHorizontal size={20} aria-hidden /> More
          </button>
        </div>
      </nav>

      {more && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="More">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setMore(false)} />
          <div className="relative bg-white rounded-t-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="font-nunito font-bold text-lg text-ink">{child.name}</p>
              <button onClick={() => setMore(false)} className="p-2 rounded-lg text-muted" aria-label="Close"><X size={20} /></button>
            </div>
            {secondary.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => go(id)} className="w-full h-14 px-3 rounded-xl flex items-center gap-3 font-dm-sans text-base text-ink hover:bg-canvas">
                <Icon size={20} className="text-teal-700" aria-hidden /> {label}
              </button>
            ))}
            <Link href="/dashboard" className="w-full h-14 px-3 rounded-xl flex items-center gap-3 font-dm-sans text-base text-ink hover:bg-canvas">
              <ArrowLeftRight size={20} className="text-teal-700" aria-hidden /> Switch child or hand over
            </Link>
            <button onClick={() => signOut(router)} className="w-full h-14 px-3 rounded-xl flex items-center gap-3 font-dm-sans text-base text-ink hover:bg-canvas">
              <LogOut size={20} className="text-teal-700" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
