"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Leaf, Lock, Star } from "lucide-react";
import { useChildStore } from "../../stores/useChildStore";
import { api } from "../../lib/api";
import { PinPad } from "../ui/kit";

function GrownUpGate({ onClose }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = async (value) => {
    try {
      await api("/api/auth/child-mode", { method: "DELETE", body: { pin: value } });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-ink/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Grown-ups only">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[var(--shadow-raised)]">
        <p className="font-nunito font-bold text-xl text-ink">Grown-ups only</p>
        <p className="font-dm-sans text-sm text-muted mt-1 mb-6">Enter your PIN to leave child mode.</p>
        <PinPad value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) submit(v); }} />
        {error && <p role="alert" className="font-dm-sans text-sm text-coral-700 mt-4">{error}</p>}
        <button onClick={onClose} className="mt-5 h-11 px-5 rounded-xl font-dm-sans font-bold text-teal-700 hover:bg-mint">Cancel</button>
      </div>
    </div>
  );
}

export default function TopStrip() {
  const router = useRouter();
  const { child, childMode, setScreen } = useChildStore();
  const [gate, setGate] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 bg-canvas/95 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between">
      <span className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
        <Leaf size={22} aria-hidden /> <span className="hidden sm:inline">NeuroBloom</span>
      </span>
      <div className="flex items-center gap-2">
        <button onClick={() => setScreen("stars")} className="h-11 px-3 rounded-xl bg-white ring-1 ring-line flex items-center gap-1.5 font-sora font-semibold text-ink tabular" aria-label={`${child.stars} stars`}>
          <Star size={20} className="text-amber-400" fill="currentColor" aria-hidden /> {child.stars}
        </button>
        <span className="h-11 px-3 rounded-xl bg-white ring-1 ring-line flex items-center gap-1.5 font-sora font-semibold text-ink tabular" aria-label={`${child.streak} day streak`}>
          <Flame size={20} className="text-coral-700" aria-hidden /> {child.streak}
        </span>
        <button
          onClick={() => (childMode ? setGate(true) : router.push("/dashboard"))}
          className="h-11 w-11 rounded-xl bg-white ring-1 ring-line flex items-center justify-center text-muted"
          aria-label="Grown-ups"
        >
          <Lock size={18} />
        </button>
      </div>
      {gate && <GrownUpGate onClose={() => setGate(false)} />}
    </header>
  );
}
