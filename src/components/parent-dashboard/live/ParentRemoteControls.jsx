"use client";

import { useParentActionSender } from "../../../hooks/useRealtimeSync";
import { useParentStore } from "../../../stores/useParentStore";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { Send, Pause, Play, Gauge, HeartHandshake } from "lucide-react";

export default function ParentRemoteControls({ liveSession }) {
  const { sendParentAction } = useParentActionSender();
  const child = useParentStore((s) => s.child);
  const currentSpeed = liveSession.speedMultiplier || 1.0;
  const isPaused = liveSession.isPaused || false;

  const stickers = [
    { id: "s1", label: "Super Focus", iconKey: "star", text: "Super Focus! ⭐" },
    { id: "s2", label: "Awesome Job", iconKey: "trophy", text: "Awesome Job! 🚀" },
    { id: "s3", label: "Calm Breath", iconKey: "heart", text: "Take a Breath 🌸" },
    { id: "s4", label: "Keep Going", iconKey: "flame", text: "Keep Going! 🔥" },
  ];

  const handleSendSticker = (sticker) => {
    sendParentAction({
      actionType: "SEND_STICKER",
      payload: sticker,
    });
  };

  const handleSpeedChange = (newSpeed) => {
    sendParentAction({
      actionType: "SET_SPEED",
      payload: { speed: newSpeed },
    });
  };

  const handleTogglePause = () => {
    sendParentAction({
      actionType: "TOGGLE_PAUSE",
      payload: { isPaused: !isPaused },
    });
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_32px_rgba(62,207,178,0.12)] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-white/60 mb-4">
          <HeartHandshake size={20} className="text-[#3ECFB2]" />
          <h3 className="font-nunito font-bold text-lg text-[#1B2D3E]">
            Live Parent Remote & Co-Regulation
          </h3>
        </div>

        {/* Send Interactive Stickers */}
        <div className="mb-5">
          <div className="font-dm-sans text-xs font-bold text-[#8FA3B1] uppercase tracking-wider mb-3">
            Send Interactive Praise Sticker
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSendSticker(sticker)}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
              >
                <SvgIconBadge type={sticker.iconKey} size={18} variant="amber" />
                <span className="font-nunito font-bold text-xs text-[#1B2D3E]">
                  {sticker.label}
                </span>
                <Send size={12} className="text-[#3ECFB2] ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Live Game Speed Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between font-dm-sans text-xs font-bold text-[#8FA3B1] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <Gauge size={14} className="text-[#3ECFB2]" /> Target Motion Speed
            </span>
            <span className="text-[#1A9E8C] font-extrabold">{currentSpeed}x</span>
          </div>
          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-white">
            <span className="text-xs font-dm-sans text-[#8FA3B1]">Slow</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.25"
              value={currentSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-[#3ECFB2] cursor-pointer"
            />
            <span className="text-xs font-dm-sans text-[#8FA3B1]">Fast</span>
          </div>
        </div>
      </div>

      {/* Emergency Remote Pause Button */}
      <button
        onClick={handleTogglePause}
        className={`w-full py-3 rounded-2xl font-nunito font-bold text-sm flex items-center justify-center gap-2 border shadow-sm transition-all active:scale-95 ${
          isPaused
            ? "bg-[#3ECFB2] text-white border-[#3ECFB2] shadow-[0_4px_0_#1A9E8C]"
            : "bg-[#FF7E6B]/15 text-[#FF7E6B] border-[#FF7E6B]/30 hover:bg-[#FF7E6B]/25"
        }`}
      >
        {isPaused ? (
          <>
            <Play size={18} /> Resume {child.name}'s Gameplay
          </>
        ) : (
          <>
            <Pause size={18} /> Trigger Gentle Calm Break
          </>
        )}
      </button>
    </div>
  );
}
