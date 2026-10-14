"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Lock, Trash2 } from "lucide-react";
import { useParentStore } from "../../../stores/useParentStore";
import { api } from "../../../lib/api";
import { IconFor } from "../../../lib/icons";
import { Button, Card, Field, Input, Segmented } from "../../ui/kit";
import SensoryProfileForm, { DEFAULT_SENSORY } from "../../shared/SensoryProfileForm";
import ConsentForm from "../../shared/ConsentForm";

function useSaver(childId, reload) {
  const [state, setState] = useState(null);
  const save = async (body) => {
    setState("saving");
    try {
      await api(`/api/children/${childId}`, { method: "PATCH", body });
      setState("saved");
      reload();
    } catch (err) {
      setState(err.message);
    }
  };
  return [state, save];
}

function SaveRow({ state, onSave }) {
  return (
    <div className="flex items-center gap-3 mt-5">
      <Button onClick={onSave} loading={state === "saving"}>Save</Button>
      {state === "saved" && <span role="status" className="font-dm-sans text-sm text-teal-700">Saved — the child app updates next time it opens.</span>}
      {state && !["saving", "saved"].includes(state) && <span role="alert" className="font-dm-sans text-sm text-coral-700">{state}</span>}
    </div>
  );
}

async function resizeImage(file, max = 160) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function TalkTiles() {
  const { child, reload } = useParentStore();
  const [label, setLabel] = useState("");
  const [iconKey, setIconKey] = useState("heart");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const add = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/api/children/${child.id}`, { method: "PATCH", body: { addTile: { label, iconKey, image } } });
      setLabel("");
      setImage(null);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await api(`/api/children/${child.id}`, { method: "PATCH", body: { removeTileId: id } }).catch(() => {});
    reload();
  };

  return (
    <Card title="Talk board: personal words">
      <p className="font-dm-sans text-[13px] text-muted -mt-2 mb-4">Add people, places and favourite things. A photo from home often works better than an icon.</p>
      <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
        {(child.aacTiles || []).map((t) => (
          <li key={t.id} className="relative rounded-xl bg-canvas p-2 flex flex-col items-center gap-1">
            {t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <IconFor name={t.iconKey} size={28} className="text-teal-700 my-2.5" />
            )}
            <span className="font-dm-sans text-[13px] font-bold text-ink text-center">{t.label}</span>
            <button onClick={() => remove(t.id)} aria-label={`Remove ${t.label}`} className="absolute top-1 right-1 p-1 rounded-md text-muted hover:text-coral-700 hover:bg-white"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex flex-col gap-3">
        <Field label="Word">{(id) => <Input id={id} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Grandma" maxLength={24} />}</Field>
        <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Icon">
          {["heart", "family", "dog", "park", "car", "school", "icecream", "pizza", "music", "book", "bike", "tv"].map((k) => (
            <button key={k} type="button" role="option" aria-selected={!image && iconKey === k} aria-label={k} onClick={() => { setIconKey(k); setImage(null); }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${!image && iconKey === k ? "bg-teal-700 text-white" : "bg-white text-ink-soft ring-1 ring-line hover:bg-mint"}`}>
              <IconFor name={k} size={18} />
            </button>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()} className={`h-10 px-3 rounded-lg inline-flex items-center gap-1.5 font-dm-sans text-sm font-bold ${image ? "bg-teal-700 text-white" : "bg-white text-teal-700 ring-1 ring-line hover:bg-mint"}`}>
            <ImagePlus size={16} aria-hidden /> {image ? "Photo added" : "Use a photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImage(await resizeImage(f)); }} />
        </div>
        {error && <p role="alert" className="font-dm-sans text-sm text-coral-700">{error}</p>}
        <Button type="submit" loading={saving} disabled={!label.trim()} className="self-start">Add word</Button>
      </form>
    </Card>
  );
}

export default function Settings() {
  const router = useRouter();
  const { child, reload } = useParentStore();
  const [sensory, setSensory] = useState(child.sensoryProfile || DEFAULT_SENSORY);
  const [consent, setConsent] = useState(child.consent || { camera: false, liveFrames: false, dataSharing: false });
  const [dailyGoal, setDailyGoal] = useState(child.dailyGoal || 4);
  const [sensoryState, saveSensory] = useSaver(child.id, reload);
  const [consentState, saveConsent] = useSaver(child.id, reload);
  const [goalState, saveGoal] = useSaver(child.id, reload);

  const lock = async () => {
    await api("/api/auth/child-mode", { method: "POST", body: { childId: child.id } }).then(
      () => router.replace("/dashboard/child"),
      () => router.push("/dashboard")
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 pb-12 items-start">
      <div className="flex flex-col gap-6">
        <Card title={`Comfort settings for ${child.name}`}>
          <SensoryProfileForm value={sensory} onChange={setSensory} />
          <SaveRow state={sensoryState} onSave={() => saveSensory({ sensoryProfile: sensory })} />
        </Card>
        <Card title="Daily goal">
          <Field label="Activities per day" hint="Shown as the ring on Today. Keep it achievable.">
            <Segmented label="Activities per day" value={dailyGoal} onChange={setDailyGoal} options={[2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
          </Field>
          <SaveRow state={goalState} onSave={() => saveGoal({ dailyGoal })} />
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card title="Privacy choices">
          <ConsentForm value={consent} onChange={setConsent} />
          <SaveRow state={consentState} onSave={() => saveConsent({ consent })} />
        </Card>
        <TalkTiles />
        <Card title="Child mode">
          <p className="font-dm-sans text-sm text-ink-soft">Lock this device to {child.name}&apos;s play space. Your PIN is needed to come back here.</p>
          <Button variant="secondary" className="mt-4 self-start" onClick={lock}><Lock size={16} aria-hidden /> Hand to {child.name}</Button>
        </Card>
      </div>
    </div>
  );
}
