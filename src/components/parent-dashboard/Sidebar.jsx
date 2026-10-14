"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Gamepad2, Leaf, LogOut } from "lucide-react";
import { useParentStore } from "../../stores/useParentStore";
import { api } from "../../lib/api";
import { PARENT_TABS } from "./nav";
import { cn } from "../../lib/cn";

export async function signOut(router) {
  await api("/api/auth/logout", { method: "POST" }).catch(() => {});
  router.replace("/login");
}

export default function Sidebar() {
  const router = useRouter();
  const { child, parent, activeTab, setActiveTab, liveSession } = useParentStore();

  return (
    <aside className="hidden md:flex w-64 shrink-0 h-dvh sticky top-0 flex-col bg-white border-r border-line">
      <div className="p-5">
        <Link href="/" className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
          <Leaf size={22} aria-hidden /> NeuroBloom
        </Link>
        <Link href="/dashboard" className="mt-6 flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-canvas" aria-label="Switch child">
          <span className="w-10 h-10 rounded-xl bg-mint text-teal-700 flex items-center justify-center font-nunito font-bold">{child.name?.slice(0, 1)}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-nunito font-bold text-ink truncate">{child.name}</span>
            <span className="block font-dm-sans text-[13px] text-muted">Age {child.age} · {child.streak}-day streak</span>
          </span>
          <ArrowLeftRight size={16} className="text-muted" aria-hidden />
        </Link>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1" aria-label="Dashboard">
        {PARENT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? "page" : undefined}
            className={cn(
              "h-11 px-3 rounded-xl flex items-center gap-3 font-dm-sans text-[15px] transition-colors",
              activeTab === id ? "bg-mint text-teal-800 font-bold" : "text-ink-soft hover:bg-canvas hover:text-ink"
            )}
          >
            <Icon size={19} aria-hidden />
            {label}
            {id === "live" && liveSession.isLive && <span className="ml-auto w-2 h-2 rounded-full bg-teal-600" aria-label="Live now" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-line flex flex-col gap-2">
        <Link href="/dashboard" className="h-11 px-3 rounded-xl flex items-center gap-3 font-dm-sans text-[15px] font-bold text-teal-700 hover:bg-mint">
          <Gamepad2 size={19} aria-hidden /> Hand to {child.name}
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-dm-sans text-xs font-bold">{parent.avatarInitials}</span>
          <span className="flex-1 font-dm-sans text-sm font-bold text-ink truncate">{parent.name}</span>
          <button onClick={() => signOut(router)} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  );
}
