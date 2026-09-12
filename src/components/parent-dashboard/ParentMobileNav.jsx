"use client";

import { useState } from "react";
import { useParentStore } from "../../stores/useParentStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function ParentMobileNav() {
  const { activeTab, setActiveTab, liveSession, child } = useParentStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: "overview", label: "Overview", icon: Home },
    { 
      id: "live", 
      label: "Live", 
      icon: Radio,
      badge: liveSession?.isLive
    },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "mood", label: "Mood", icon: Smile },
  ];

  const secondaryNavItems = [
    { id: "sessions", label: "Session History", icon: Gamepad2, desc: "Past modules & activity" },
    { id: "reports", label: "Clinical Reports", icon: ClipboardList, desc: "Weekly & monthly progress" },
    { id: "notes", label: "Therapist Notes", icon: Stethoscope, desc: "Direct feedback from Dr. Neha" },
    { id: "settings", label: "Child Settings", icon: Settings, desc: "Limits, goals & preferences" },
  ];

  const isMoreActive = secondaryNavItems.some(item => item.id === activeTab);

  return (
    <>
      {/* Floating macOS / iOS Dock Style Bottom Bar */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-40 md:hidden">
        <nav className="relative bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgba(27,45,62,0.18)] rounded-3xl p-1.5 flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMoreMenu(false);
                }}
                className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-colors min-w-[64px] ${
                  isActive ? "text-[#1A9E8C]" : "text-[#8FA3B1] hover:text-[#1B2D3E]"
                }`}
              >
                {/* Active Dock Highlight Pill */}
                {isActive && (
                  <motion.div
                    layoutId="parent-dock-pill"
                    className="absolute inset-0 bg-gradient-to-b from-[#3ECFB2]/20 to-[#3ECFB2]/10 rounded-2xl border border-[#3ECFB2]/40 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="relative">
                    <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ECFB2] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1A9E8C]"></span>
                      </span>
                    )}
                  </div>
                  <span className={`font-dm-sans text-[11px] leading-none tracking-tight ${
                    isActive ? "font-bold text-[#1A9E8C]" : "font-medium text-[#8FA3B1]"
                  }`}>
                    {item.label}
                  </span>
                </div>
              </motion.button>
            );
          })}

          {/* More Menu Dock Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMoreMenu(true)}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-colors min-w-[64px] ${
              showMoreMenu || isMoreActive ? "text-[#1A9E8C]" : "text-[#8FA3B1] hover:text-[#1B2D3E]"
            }`}
          >
            {(showMoreMenu || isMoreActive) && (
              <motion.div
                layoutId="parent-dock-pill"
                className="absolute inset-0 bg-gradient-to-b from-[#3ECFB2]/20 to-[#3ECFB2]/10 rounded-2xl border border-[#3ECFB2]/40 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <MoreHorizontal size={20} className={showMoreMenu || isMoreActive ? "stroke-[2.5]" : "stroke-[2]"} />
              <span className={`font-dm-sans text-[11px] leading-none tracking-tight ${
                showMoreMenu || isMoreActive ? "font-bold text-[#1A9E8C]" : "font-medium text-[#8FA3B1]"
              }`}>
                More
              </span>
            </div>
          </motion.button>
        </nav>
      </div>

      {/* Floating Animated Slide-Up Drawer Modal */}
      <AnimatePresence>
        {showMoreMenu && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1B2D3E]/50 backdrop-blur-md"
              onClick={() => setShowMoreMenu(false)}
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-white/80 max-h-[85vh] overflow-y-auto"
            >
              {/* Top Handle bar */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3ECFB2] to-[#1A9E8C] text-white font-nunito font-bold flex items-center justify-center text-sm shadow-md">
                    {child.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-nunito font-extrabold text-lg text-[#1B2D3E]">
                      {child.name}&apos;s Dashboard
                    </h3>
                    <p className="font-dm-sans text-xs text-[#8FA3B1]">
                      Age {child.age} • {child.streak}-day active streak
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category Subheadings & Nav Links */}
              <div className="mb-2">
                <p className="font-dm-sans text-[11px] font-bold text-[#8FA3B1] uppercase tracking-wider px-1 mb-2">
                  Clinical & Monitoring Tools
                </p>
                <div className="space-y-2">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left ${
                          isActive
                            ? "bg-[#3ECFB2]/15 text-[#1A9E8C] border border-[#3ECFB2]/30 shadow-sm"
                            : "text-[#1B2D3E] hover:bg-slate-50 border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            isActive ? "bg-[#3ECFB2] text-white" : "bg-[#E8FAF6] text-[#1A9E8C]"
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-dm-sans font-bold text-sm text-[#1B2D3E]">
                              {item.label}
                            </div>
                            <div className="font-dm-sans text-xs text-[#8FA3B1]">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#8FA3B1]" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Action Banner to Child View */}
              <div className="mt-6">
                <Link
                  href="/dashboard/child"
                  className="w-full bg-gradient-to-r from-[#1B2D3E] to-[#2A435B] text-white p-4 rounded-2xl font-nunito font-bold text-center flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3ECFB2] text-[#1B2D3E] rounded-xl">
                      <Gamepad2 size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        Switch to Child Interface <Sparkles size={14} className="text-[#FFB020]" />
                      </div>
                      <div className="text-xs text-white/70 font-normal">
                        Launch interactive game environment
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3ECFB2]" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

