"use client";

import { useParentStore } from "../../stores/useParentStore";
import Link from "next/link";
import { Home, Radio, TrendingUp, Smile, Gamepad2, ClipboardList, Stethoscope, Settings, Leaf, Flame } from "lucide-react";

export default function Sidebar() {
  const { child, parent, activeTab, setActiveTab } = useParentStore();

  const navItems = [
    { id: "overview", icon: <Home size={20} />, label: "Overview" },
    { id: "live", icon: <Radio size={20} className="animate-pulse text-[#3ECFB2]" />, label: "Live Tracking" },
    { id: "progress", icon: <TrendingUp size={20} />, label: "Progress" },
    { id: "mood", icon: <Smile size={20} />, label: "Mood & Emotions" },
    { id: "sessions", icon: <Gamepad2 size={20} />, label: "Sessions" },
    { id: "reports", icon: <ClipboardList size={20} />, label: "Reports" },
    { id: "notes", icon: <Stethoscope size={20} />, label: "Therapist Notes" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/60 shadow-[4px_0_24px_rgba(62,207,178,0.08)] hidden md:flex overflow-hidden">
      {/* Top Section */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="flex items-center text-[#3ECFB2]"><Leaf size={24} /></span>
          <h1 className="font-nunito font-bold text-[#3ECFB2] text-xl tracking-tight relative">
            NeuroBloom
          </h1>
        </div>

        {/* Child Selector */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#3ECFB2]/20 flex items-center justify-center text-[#1A9E8C] font-bold font-dm-sans shadow-sm">
              {child.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-nunito font-bold text-[#1B2D3E] text-sm leading-tight">
                {child.name} (Age {child.age})
              </div>
            </div>
            <div className="text-[#8FA3B1] text-xs">▾</div>
          </div>
          <div className="bg-[#3ECFB2] text-white rounded-2xl px-3 py-1.5 text-xs font-bold shadow-[0_3px_0_#1A9E8C] self-start ml-2 flex items-center gap-1.5">
            <span className="flex items-center"><Flame size={14} /></span> {child.streak} day streak
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-2 space-y-1 custom-scrollbar pb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mx-2 text-sm transition-all text-left ${
              activeTab === item.id
                ? "bg-[#3ECFB2]/15 text-[#1A9E8C] font-semibold border-r-2 border-[#3ECFB2]"
                : "text-[#8FA3B1] hover:bg-[#E8FAF6] hover:text-[#1B2D3E]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-dm-sans">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-white/60">
        <Link href="/dashboard/child" className="font-dm-sans text-sm text-[#1B2D3E] font-bold hover:text-[#3ECFB2] hover:bg-white/80 transition-colors mb-4 block bg-white/50 p-2.5 rounded-xl text-center border border-white/60 shadow-sm flex items-center justify-center gap-2">
          <span><Gamepad2 size={16} /></span> Child Dashboard
        </Link>
        <a href="#" className="font-dm-sans text-xs text-[#8FA3B1] hover:text-[#3ECFB2] transition-colors mb-4 block">
          Need help? &rarr;
        </a>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#4A90D9]/20 flex items-center justify-center text-[#4A90D9] font-bold text-xs">
            {parent.avatarInitials}
          </div>
          <div>
            <div className="font-nunito font-bold text-[#1B2D3E] text-sm">{parent.name} M.</div>
            <div className="font-dm-sans text-[#8FA3B1] text-xs hover:text-[#FF7E6B] transition-colors">Log out</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
