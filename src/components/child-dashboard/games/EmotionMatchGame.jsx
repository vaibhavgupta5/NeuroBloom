"use client";

import Face from "../content/Face";
import QuizGame from "./QuizGame";
import { EMOTION_LEVELS, EMOTION_WORDS, choicesForLevel, shuffle } from "../../../lib/content/quizBanks";

const PROMPTS = ["How does this face feel?", "Which feeling is this?", "Find the feeling."];

// Show a face; pick the feeling word (spoken aloud when tapped or wrong).
function buildItems(level) {
  const { pool, intensity } = EMOTION_LEVELS[level] || EMOTION_LEVELS[1];
  const n = Math.min(choicesForLevel(level), pool.length);
  return Array.from({ length: 6 }, (_, i) => {
    const target = pool[i % pool.length];
    const shade = intensity[Math.floor(Math.random() * intensity.length)];
    const distractors = shuffle(pool.filter((e) => e !== target)).slice(0, n - 1);
    return {
      id: `${target}-${shade}-${i}`,
      prompt: PROMPTS[i % PROMPTS.length],
      visual: <Face emotion={target} intensity={shade} size={180} title="A face showing a feeling" />,
      choices: shuffle([target, ...distractors]).map((e) => ({
        id: e,
        label: EMOTION_WORDS[e],
        correct: e === target,
        showLabel: true,
        render: <Face emotion={e} intensity="high" size={72} />,
      })),
    };
  }).sort(() => Math.random() - 0.5);
}

export default function EmotionMatchGame() {
  return (
    <QuizGame
      moduleCode="emotion-match"
      title="Feelings Game"
      skill="Emotions"
      buildItems={buildItems}
      introText="Let's look at faces and find the feeling."
    />
  );
}
