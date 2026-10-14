"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Gamepad2, Leaf, Lock, LogOut, Plus } from "lucide-react";
import { api } from "../../lib/api";
import { Button, PinPad } from "../../components/ui/kit";
import { cn } from "../../lib/cn";

export default function DashboardHub() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/auth/me")
      .then((data) => {
        if (data.user.role === "therapist") return router.replace("/therapist");
        if (data.childMode) return router.replace("/dashboard/child");
        if (!data.children.length) return router.replace("/onboarding");
        setMe(data);
        setSelected(data.activeChildId || data.children[0].id);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const choose = async (id) => {
    setSelected(id);
    await api("/api/auth/select-child", { method: "POST", body: { childId: id } }).catch(() => {});
  };

  const openDashboard = async () => {
    setBusy(true);
    await choose(selected);
    router.push("/dashboard/parent");
  };

  const startChildMode = async (pinValue) => {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/child-mode", { method: "POST", body: { childId: selected, pin: pinValue } });
      router.replace("/dashboard/child");
    } catch (err) {
      setError(err.message);
      setPin("");
      setBusy(false);
    }
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  if (!me) return <main className="min-h-dvh bg-canvas" aria-busy="true" />;
  const child = me.children.find((c) => c.id === selected);

  return (
    <main className="min-h-dvh bg-canvas px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
            <Leaf size={22} aria-hidden /> NeuroBloom
          </span>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut size={16} aria-hidden /> Sign out</Button>
        </header>

        <h1 className="font-nunito font-extrabold text-3xl text-ink mt-10">Hi {me.user.name.split(" ")[0]}</h1>
        <p className="font-dm-sans text-muted mt-1">Who are we working with today?</p>

        <div className="mt-6 flex flex-wrap gap-3" role="radiogroup" aria-label="Child">
          {me.children.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={selected === c.id}
              onClick={() => choose(c.id)}
              className={cn(
                "h-14 pl-2 pr-5 rounded-2xl flex items-center gap-3 font-nunito font-bold text-lg transition-colors",
                selected === c.id ? "bg-teal-700 text-white" : "bg-white text-ink ring-1 ring-line hover:bg-mint"
              )}
            >
              <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-base", selected === c.id ? "bg-white/20" : "bg-mint text-teal-700")}>
                {c.name.slice(0, 1)}
              </span>
              {c.name}
            </button>
          ))}
          <Link href="/onboarding" className="h-14 px-5 rounded-2xl flex items-center gap-2 font-dm-sans font-bold text-teal-700 border-2 border-dashed border-teal-400 hover:bg-mint">
            <Plus size={18} aria-hidden /> Add child
          </Link>
        </div>

        {!pinMode ? (
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <button onClick={openDashboard} disabled={busy} className="card p-6 text-left hover:shadow-[var(--shadow-raised)] transition-shadow">
              <BarChart3 className="text-teal-700" size={28} aria-hidden />
              <h2 className="font-nunito font-bold text-xl text-ink mt-4">Parent dashboard</h2>
              <p className="font-dm-sans text-sm text-muted mt-1">Today, progress, logs, the care team and settings for {child?.name}.</p>
            </button>
            <button onClick={() => (me.user.hasPin ? startChildMode() : setPinMode(true))} disabled={busy} className="card p-6 text-left hover:shadow-[var(--shadow-raised)] transition-shadow">
              <Gamepad2 className="text-coral-700" size={28} aria-hidden />
              <h2 className="font-nunito font-bold text-xl text-ink mt-4">Hand to {child?.name}</h2>
              <p className="font-dm-sans text-sm text-muted mt-1 flex items-center gap-1.5">
                <Lock size={14} aria-hidden /> Locks this device to {child?.name}&apos;s play space. Your PIN unlocks it.
              </p>
            </button>
          </div>
        ) : (
          <div className="card p-6 mt-8 flex flex-col items-center text-center">
            <h2 className="font-nunito font-bold text-xl text-ink">Choose a 4-digit PIN</h2>
            <p className="font-dm-sans text-sm text-muted mt-1 mb-6 max-w-sm">You&apos;ll need it to leave child mode. Keep it somewhere your child won&apos;t see.</p>
            <PinPad value={pin} onChange={(v) => { setPin(v); if (v.length === 4) startChildMode(v); }} />
            {error && <p role="alert" className="font-dm-sans text-sm text-coral-700 mt-4">{error}</p>}
            <Button variant="ghost" className="mt-4" onClick={() => { setPinMode(false); setPin(""); }}>Cancel</Button>
          </div>
        )}
        {error && !pinMode && <p role="alert" className="font-dm-sans text-sm text-coral-700 mt-4">{error}</p>}
      </div>
    </main>
  );
}
