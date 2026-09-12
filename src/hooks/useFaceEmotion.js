"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { interpretBlendshapes } from "../lib/emotionUtils";

const SNAPSHOT_INTERVAL_MS = 10_000; // single frame, replaced each time
const SMOOTHING_WINDOW = 10; // detections averaged before an emotion change
const MPS_VERSION = "0.10.22"; // keep in sync with package.json @mediapipe/tasks-vision

/**
 * Camera emotion pipeline (MediaPipe FaceLandmarker).
 *
 * PRIVACY: no video is ever recorded or stored. The only image data produced
 * is a single 160x120 JPEG (base64) captured once every 10 seconds — each new
 * frame REPLACES the previous one.
 *
 * Permission flow: never auto-starts. The UI calls requestCamera() so the
 * browser prompt is a user action. If permission is denied, status becomes
 * 'denied' and the games fall back to AUTO MODE (gameplay-only adaptation).
 *
 * Returns { status, emotion, emotionConfidence, snapshot, requestCamera, stopCamera }
 *   status ∈ 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
 */
export function useFaceEmotion() {
  const [status, setStatus] = useState("idle");
  const [emotion, setEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [snapshot, setSnapshot] = useState(null);

  const videoRef = useRef(null);
  const snapCanvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const windowRef = useRef([]); // rolling detection results
  const lastSnapshotAtRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const mountedRef = useRef(true);

  const teardown = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close();
      } catch {
        // already closed
      }
      landmarkerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    windowRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      teardown();
    };
  }, [teardown]);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    // Only run detection on fresh frames
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result = landmarker.detectForVideo(video, performance.now());
        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const reading = result.faceBlendshapes?.[0]?.categories
            ? interpretBlendshapes(result.faceBlendshapes[0].categories)
            : { emotion: "neutral", confidence: 0.5, scores: {} };

          // Smooth over a rolling window so the label doesn't flicker
          const win = windowRef.current;
          win.push(reading);
          if (win.length > SMOOTHING_WINDOW) win.shift();

          const tally = {};
          let confSum = 0;
          for (const r of win) {
            tally[r.emotion] = (tally[r.emotion] || 0) + 1;
            confSum += r.confidence;
          }
          const smoothed =
            Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
          const avgConf = confSum / win.length;

          if (mountedRef.current) {
            setEmotion(smoothed);
            setEmotionConfidence(Math.round(avgConf * 100) / 100);
          }
        }
      } catch {
        // transient detection error — keep looping
      }

      // Single-frame snapshot every 10s (replaces the previous one)
      const now = Date.now();
      if (now - lastSnapshotAtRef.current >= SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAtRef.current = now;
        const snapCanvas = snapCanvasRef.current;
        if (snapCanvas && video.readyState >= 2) {
          try {
            const ctx = snapCanvas.getContext("2d");
            ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
            const data = snapCanvas.toDataURL("image/jpeg", 0.6);
            if (mountedRef.current) setSnapshot(data);
          } catch {
            // frame grab failed — retry next interval
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, []);

  const requestCamera = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (status === "granted" || status === "requesting") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      // Lazy-load MediaPipe only after permission is granted
      const { FaceLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );
      const fileset = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MPS_VERSION}/wasm`
      );
      const landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      });

      if (!mountedRef.current) {
        landmarker.close();
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      landmarkerRef.current = landmarker;

      // Hidden video + canvases (no visible UI)
      const video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.width = 320;
      video.height = 240;
      video.srcObject = stream;
      videoRef.current = video;

      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = 160;
      snapCanvas.height = 120;
      snapCanvasRef.current = snapCanvas;

      await video.play();
      lastVideoTimeRef.current = -1;
      lastSnapshotAtRef.current = Date.now();
      setStatus("granted");
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setStatus("denied"); // → auto mode (gameplay-only adaptation)
      } else if (err?.name === "NotFoundError") {
        setStatus("unsupported");
      } else {
        // Model load failure etc. — degrade to auto mode rather than crash
        console.error("Camera emotion init failed:", err?.message);
        setStatus("unsupported");
      }
    }
  }, [status, detectLoop]);

  const stopCamera = useCallback(() => {
    teardown();
    if (mountedRef.current) {
      setStatus("idle");
      setEmotion(null);
      setEmotionConfidence(0);
      setSnapshot(null);
    }
  }, [teardown]);

  return { status, emotion, emotionConfidence, snapshot, requestCamera, stopCamera };
}
