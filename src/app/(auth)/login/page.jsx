"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";
import { Button, Field, Input } from "../../../components/ui/kit";

const DEMO = [
  { label: "Parent demo", email: "priya@demo.neurobloom.app" },
  { label: "Therapist demo", email: "neha@demo.neurobloom.app" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e, creds) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api("/api/auth/login", { method: "POST", body: creds || { email, password } });
      const next = params.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : res.next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-nunito font-extrabold text-3xl text-ink">Welcome back</h1>
      <p className="font-dm-sans text-muted mt-2">Sign in as a parent or therapist.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Email">
          {(id) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
        </Field>
        <Field label="Password" error={error}>
          {(id) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2">Sign in</Button>
      </form>

      <div className="mt-8 rounded-2xl bg-mint p-4">
        <p className="font-dm-sans text-sm font-bold text-ink">Exploring? Use a demo account</p>
        <p className="font-dm-sans text-[13px] text-muted mt-0.5">Sample data, reset whenever the demo is re-seeded.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <Button key={d.email} variant="secondary" size="sm" disabled={loading} onClick={() => submit(null, { email: d.email, password: "bloom-demo" })}>
              {d.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="font-dm-sans text-sm text-muted mt-8">
        New here? <Link href="/signup" className="font-bold text-teal-700 underline">Create an account</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
