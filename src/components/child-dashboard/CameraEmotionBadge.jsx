"use client";

import { Camera } from "lucide-react";
import { useCameraEmotion } from "../../context/CameraEmotionContext";

/**
 * Small, passive "camera is on" indicator — shown only when a parent has
 * already turned the camera on for this child. The child is never asked to
 * decide; there is no permission prompt here (that choice belongs to the
 * parent, in Settings).
 */
export default function CameraEmotionBadge() {
  const { allowed, status } = useCameraEmotion();
  if (!allowed || status !== "granted") return null;

  return (
    <div
      className="fixed top-20 right-3 md:right-6 z-30 w-9 h-9 rounded-full bg-white/90 ring-1 ring-line flex items-center justify-center text-teal-700"
      title="Camera is on"
      aria-label="Camera is on"
    >
      <Camera size={16} />
    </div>
  );
}
