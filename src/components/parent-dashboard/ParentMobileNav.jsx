"use client";

import { useState } from "react";
import { useParentStore } from "../../stores/useParentStore";
import Link from "next/link";
import { 
  Home, 
  Radio, 
  TrendingUp, 
  Smile, 
  MoreHorizontal, 
  Gamepad2, 
  ClipboardList, 
  Stethoscope, 
  Settings, 
  X,
  Flame,
  User
} from "lucide-react";

export default function ParentMobileNav() {
  const { activeTab, setActiveTab, liveSession, child } = useParentStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: "overview", label: "Overview", icon: <Home size={20} /> },
    { 
      id: "live", 
      label: "Live", 
      icon: (
        <div className="relative">
          <Radio size={20} className={liveSession?.isLive ? "text-[#3ECFB2] animate-pulse" : ""} />
          {liveSession?.isLive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#3ECFB2] rounded-full animate-ping" />
          )}
        </div>
      ) 
    },
    { id: "progress", label: "Progress", icon: <TrendingUp size={20} /> },
    { id: "mood", label: "Mood", icon: <Smile size={20} /> },
  ];

  const secondaryNavItems = [
    { id: "sessions", label: "Sessions", icon: <Gamepad2 size={20} /> },
    { id: "reports", label: "Reports", icon: <ClipboardList size={20} /> },
    { id: "notes", label: "Therapist Notes", icon: <Stethoscope size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Fixed Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-white/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden px-3 py-2">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#3ECFB2]/20 text-[#1A9E8C] font-bold"
                    : "text-[#8FA3B1] hover:text-[#1B2D3E]"
                }`}
              >
                {item.icon}
                <span className="font-dm-sans text-[11px] font-bold">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              showMoreMenu || ["sessions", "reports", "notes", "settings"].includes(activeTab)
                ? "bg-[#3ECFB2]/20 text-[#1A9E8C] font-bold"
                : "text-[#8FA3B1] hover:text-[#1B2D3E]"
            }`}
          >
            <MoreHorizontal size={20} />
            <span className="font-dm-sans text-[11px] font-bold">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Slide-Up Modal */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-[#1B2D3E]/40 backdrop-blur-sm"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl border-t-2 border-white/80 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#3ECFB2]/20 text-[#1A9E8C] font-bold flex items-center justify-center text-xs">
                  {child.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="font-nunito font-bold text-lg text-[#1B2D3E]">
                  {child.name}'s Dashboard
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-2 mb-6">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left font-dm-sans text-sm ${
                    activeTab === item.id
                      ? "bg-[#3ECFB2]/15 text-[#1A9E8C] font-bold border border-[#3ECFB2]/30"
                      : "text-[#1B2D3E] hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[#3ECFB2]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Switch to Child View */}
            <Link
              href="/dashboard/child"
              className="w-full bg-[#E8FAF6] text-[#1A9E8C] p-4 rounded-2xl font-nunito font-bold text-center border border-[#3ECFB2]/30 flex items-center justify-center gap-2 shadow-sm"
            >
              <Gamepad2 size={20} /> Open Child Interactive Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
