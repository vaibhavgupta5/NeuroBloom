import Link from "next/link";
import { Leaf } from "lucide-react";

export const metadata = { title: "Privacy — NeuroBloom" };

const SECTIONS = [
  {
    h: "Who can see your child's data",
    p: [
      "Only the parent account that created the child profile, and therapists the parent links with an invite code. There are no other viewers, no advertising, and no data sales.",
      "Parents can unlink a therapist at any time from Settings → Care team.",
    ],
  },
  {
    h: "What we store",
    p: [
      "Game sessions (answers, how much help was needed, timing), mood check-ins, Talk-board sentences, routines, and any notes or logs carers write.",
      "We store your email and a salted hash of your password and PIN — never the plain text.",
    ],
  },
  {
    h: "The camera",
    p: [
      "Camera features are off by default and only a parent can turn them on. Your child is never asked to consent on their own.",
      "Expression estimates run in the browser on your device using MediaPipe. Video is never recorded or uploaded.",
      "If a parent also turns on live snapshots, one small low-resolution still is shared with signed-in carers every few seconds during a game. Only the latest frame is kept, and it is cleared when the game ends.",
      "Expression estimates are approximate. Research shows these models were trained mostly on neurotypical faces and can misread autistic children's expressions, so NeuroBloom never uses them to judge how your child feels — only to offer a break or to play Mirror Me.",
    ],
  },
  {
    h: "AI-drafted reports",
    p: [
      "When a therapist asks for a report draft, a summary of the numbers (not names of other children, not camera data) is sent to Anthropic's Claude API to write a first draft. The therapist reviews and edits it before parents can see it.",
    ],
  },
  {
    h: "Children's privacy laws",
    p: [
      "NeuroBloom is designed around verifiable parental consent, data minimisation and parent control, in the spirit of India's DPDP Act 2023, the US COPPA rule and the UK Age Appropriate Design Code. This is a pilot; contact us before using it in a regulated clinical setting.",
    ],
  },
  {
    h: "Deleting data",
    p: ["Email the team from your account address and we will delete the account and every child record linked to it."],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-canvas px-4 py-12">
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 font-nunito font-extrabold text-xl text-teal-700">
          <Leaf size={22} aria-hidden /> NeuroBloom
        </Link>
        <h1 className="font-nunito font-extrabold text-4xl text-ink mt-10">Privacy, in plain language</h1>
        <p className="font-dm-sans text-lg text-ink-soft mt-4 leading-relaxed">
          NeuroBloom is used by children, so we collect as little as we can and give parents the controls.
        </p>
        {SECTIONS.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-nunito font-bold text-2xl text-ink">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="font-dm-sans text-[17px] text-ink-soft mt-3 leading-relaxed">{t}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
