"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { api } from "../../lib/api";
import { Button, Field, Input } from "../../components/ui/kit";
import SensoryProfileForm, { DEFAULT_SENSORY } from "../../components/shared/SensoryProfileForm";
import ConsentForm from "../../components/shared/ConsentForm";

const STEPS = ["About your child", "Comfort settings", "Privacy choices", "Care team"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sensory, setSensory] = useState(DEFAULT_SENSORY);
  const [consent, setConsent] = useState({ camera: false, liveFrames: false, dataSharing: false });
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = () => {
    setError("");
    if (step === 0 && (!name.trim() || !(Number(age) >= 2 && Number(age) <= 18))) {
      setError("Enter a first name and an age between 2 and 18.");
      return;
    }
    setStep((s) => s + 1);
  };

  const finish = async () => {
    setLoading(true);
    setError("");
    try {
      const { child } = await api("/api/children", {
        method: "POST",
        body: { name: name.trim(), age: Number(age), sensoryProfile: sensory, consent: { ...consent, dataSharing: consent.dataSharing || Boolean(inviteCode.trim()) } },
      });
      if (inviteCode.trim()) {
        await api(`/api/children/${child.id}/therapist`, { method: "POST", body: { inviteCode } }).catch((err) => {
          throw new Error(`${child.name}'s profile was created, but linking failed: ${err.message} You can add the code later in Settings.`);
        });
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-canvas px-4 py-10">
      <div className="mx-auto max-w-xl">
        <p className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
          <Leaf size={22} aria-hidden /> NeuroBloom
        </p>
        <ol className="mt-8 flex gap-2" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-teal-700" : "bg-line"}`} aria-current={i === step ? "step" : undefined}>
              <span className="sr-only">{s}</span>
            </li>
          ))}
        </ol>
        <h1 className="font-nunito font-extrabold text-3xl text-ink mt-6">{STEPS[step]}</h1>

        <div className="card p-6 mt-6">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Field label="First name or nickname" hint="Shown on your child's screens.">
                {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} autoFocus />}
              </Field>
              <Field label="Age">
                {(id) => <Input id={id} type="number" inputMode="numeric" min={2} max={18} value={age} onChange={(e) => setAge(e.target.value)} className="w-28" />}
              </Field>
            </div>
          )}
          {step === 1 && (
            <>
              <p className="font-dm-sans text-[15px] text-ink-soft mb-4">
                Every child experiences sound and movement differently. Start calm — you can change these any time.
              </p>
              <SensoryProfileForm value={sensory} onChange={setSensory} />
            </>
          )}
          {step === 2 && (
            <>
              <p className="font-dm-sans text-[15px] text-ink-soft mb-2">
                Everything here is off until you turn it on. Your child is never asked to agree to these themselves.
              </p>
              <ConsentForm value={consent} onChange={setConsent} />
            </>
          )}
          {step === 3 && (
            <Field label="Therapist invite code" hint="Optional. Ask your therapist for their NeuroBloom code to share progress with them.">
              {(id) => <Input id={id} value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. NEHA2026" className="uppercase tracking-wider" />}
            </Field>
          )}
          {error && <p role="alert" className="font-dm-sans text-sm text-coral-700 mt-4">{error}</p>}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || loading}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={finish} loading={loading}>Finish setup</Button>
          )}
        </div>
      </div>
    </main>
  );
}
