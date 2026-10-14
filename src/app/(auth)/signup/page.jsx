"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Button, Field, Input, Segmented } from "../../../components/ui/kit";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("parent");
  const [form, setForm] = useState({ name: "", email: "", password: "", organization: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api("/api/auth/signup", { method: "POST", body: { ...form, role } });
      router.replace(res.next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-nunito font-extrabold text-3xl text-ink">Create your account</h1>
      <p className="font-dm-sans text-muted mt-2">Free while NeuroBloom is in pilot.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
        <Segmented
          label="I am a"
          value={role}
          onChange={setRole}
          options={[
            { value: "parent", label: "Parent or carer" },
            { value: "therapist", label: "Therapist" },
          ]}
        />
        <Field label="Your name">
          {(id) => <Input id={id} autoComplete="name" value={form.name} onChange={set("name")} required />}
        </Field>
        {role === "therapist" && (
          <Field label="Clinic or practice" hint="Optional — shown to families you work with.">
            {(id) => <Input id={id} autoComplete="organization" value={form.organization} onChange={set("organization")} />}
          </Field>
        )}
        <Field label="Email">
          {(id) => <Input id={id} type="email" autoComplete="email" value={form.email} onChange={set("email")} required />}
        </Field>
        <Field label="Password" hint="At least 8 characters." error={error}>
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={form.password} onChange={set("password")} minLength={8} required />}
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2">Create account</Button>
        <p className="font-dm-sans text-[13px] text-muted">
          By continuing you agree to how we handle data, described in our <Link href="/privacy" className="underline">privacy summary</Link>.
        </p>
      </form>

      <p className="font-dm-sans text-sm text-muted mt-8">
        Already have an account? <Link href="/login" className="font-bold text-teal-700 underline">Sign in</Link>
      </p>
    </>
  );
}
