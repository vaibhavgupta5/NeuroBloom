"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Leaf, LogOut } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/kit";

export default function TherapistLayout({ children }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api("/api/auth/me").then(setMe, () => router.replace("/login"));
  }, [router]);

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(me.user.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 bg-white border-b border-line px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/therapist" className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
          <Leaf size={22} aria-hidden /> NeuroBloom <span className="font-dm-sans text-sm font-normal text-muted">for therapists</span>
        </Link>
        {me && (
          <div className="flex items-center gap-3">
            <button onClick={copyCode} className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-mint font-dm-sans text-sm font-bold text-teal-800" aria-label="Copy invite code">
              <Copy size={14} aria-hidden /> {copied ? "Copied!" : me.user.inviteCode}
            </button>
            <span className="font-dm-sans text-sm font-bold text-ink hidden sm:inline">{me.user.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut size={15} aria-hidden /></Button>
          </div>
        )}
      </header>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">{children}</div>
    </div>
  );
}
