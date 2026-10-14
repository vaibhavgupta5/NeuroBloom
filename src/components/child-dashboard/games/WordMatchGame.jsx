"use client";

import { PICTURES as Icons } from "../content/pictures";
import QuizGame from "./QuizGame";
import { WORDS, choicesForLevel, shuffle } from "../../../lib/content/quizBanks";

const COLORS = ["#17977F", "#2B6CB0", "#D9603F", "#7C66D9", "#B07800"];

// Hear (and see) a word; tap its picture. Level 3 uses pictures from the same category.
function buildItems(level) {
  const n = choicesForLevel(level);
  const targets = shuffle(WORDS).slice(0, 6);
  return targets.map((target, i) => {
    const sameCategory = WORDS.filter((w) => w.word !== target.word && w.category === target.category);
    const otherCategory = WORDS.filter((w) => w.category !== target.category);
    const distractors = shuffle(level >= 3 ? sameCategory : otherCategory).slice(0, n - 1);
    return {
      id: target.word,
      prompt: `Find the ${target.word}.`,
      visual: <span className="block px-6 py-2 font-nunito font-extrabold text-5xl md:text-6xl text-ink">{target.word}</span>,
      choices: shuffle([target, ...distractors]).map((w, j) => {
        const Icon = Icons[w.icon];
        return {
          id: w.word,
          label: w.word,
          correct: w.word === target.word,
          showLabel: level === 1,
          render: <Icon size={72} strokeWidth={1.75} color={COLORS[(i + j) % COLORS.length]} aria-hidden />,
        };
      }),
    };
  });
}

export default function WordMatchGame() {
  return (
    <QuizGame
      moduleCode="word-match"
      title="Word Match"
      skill="Communication"
      buildItems={buildItems}
      introText="Listen to the word, then tap its picture."
    />
  );
}
