"use client";

import { CalendarDays, Gamepad2, Heart, Home, MessageCircle } from "lucide-react";
import { useChildStore } from "../../stores/useChildStore";
import { useSoundEffect } from "../../hooks/useSoundEffect";
import { useSpeak } from "../../hooks/useSpeak";
import { cn } from "../../lib/cn";

const TABS = [
  { id: "home", label: "Home", icon: Home, tint: "text-blue-700 bg-blue-50" },
  { id: "play", label: "Play", icon: Gamepad2, tint: "text-coral-700 bg-coral-50" },
  { id: "talk", label: "Talk", icon: MessageCircle, tint: "text-teal-700 bg-teal-50" },
  { id: "schedule", label: "My day", icon: CalendarDays, tint: "text-amber-700 bg-amber-50" },
  { id: "feel", label: "Feel", icon: Heart, tint: "text-lavender-700 bg-lavender-50" },
];

export default function BottomNav() {
  const { activeScreen, setScreen, activeGame } = useChildStore();
  const sound = useSoundEffect();
  const { speak } = useSpeak();
  if (activeGame) return null;

  return (
    <nav aria-label="Child" className="fixed z-40 bottom-0 inset-x-0 md:inset-x-auto md:left-4 md:top-20 md:bottom-4 md:w-24 bg-white md:rounded-3xl border-t md:border-0 border-line md:shadow-[var(--shadow-card)] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5 md:grid-cols-1 md:gap-2 md:py-3 h-full md:h-auto">
        {TABS.map(({ id, label, icon: Icon, tint }) => {
          const active = activeScreen === id;
          return (
            <li key={id}>
              <button
                onClick={() => { sound("tap"); speak(label); setScreen(id); }}
                aria-current={active ? "page" : undefined}
                className="w-full h-20 flex flex-col items-center justify-center gap-1"
              >
                <span className={cn("w-12 h-10 rounded-2xl flex items-center justify-center transition-colors", active ? tint : "text-muted")}>
                  <Icon size={26} strokeWidth={active ? 2.5 : 2} aria-hidden />
                </span>
                <span className={cn("font-nunito text-[15px]", active ? "font-extrabold text-ink" : "font-bold text-muted")}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
