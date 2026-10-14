import Link from "next/link";
import { Leaf } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-dvh bg-canvas grid lg:grid-cols-[1fr_minmax(0,520px)]">
      <aside className="hidden lg:flex flex-col justify-between bg-teal-800 text-white p-12">
        <Link href="/" className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl">
          <Leaf size={22} aria-hidden /> NeuroBloom
        </Link>
        <div className="max-w-md">
          <p className="font-nunito font-bold text-3xl leading-tight text-balance">
            Short, calm practice at home — and a clear picture for the people who support your child.
          </p>
          <ul className="mt-8 space-y-3 font-dm-sans text-[15px] text-teal-100">
            <li>Games that adjust prompts and difficulty to your child</li>
            <li>Visual schedules, a Talk board and a Calm Corner</li>
            <li>Progress your child&apos;s therapist can see and act on</li>
          </ul>
        </div>
        <p className="font-dm-sans text-sm text-teal-100">
          Camera features are off unless a parent turns them on. <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </aside>
      <div className="flex flex-col justify-center px-4 py-10 sm:px-10">
        <Link href="/" className="lg:hidden inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700 mb-8">
          <Leaf size={22} aria-hidden /> NeuroBloom
        </Link>
        <div className="w-full max-w-sm mx-auto lg:mx-0">{children}</div>
      </div>
    </main>
  );
}
