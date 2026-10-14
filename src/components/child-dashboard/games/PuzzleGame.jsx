"use client";

import { PICTURES as Icons } from "../content/pictures";
import QuizGame from "./QuizGame";
import { SHAPES, SHAPE_COLORS, choicesForLevel, shuffle } from "../../../lib/content/quizBanks";

// Match a coloured shape to its shadow. Level 3 draws look-alike shapes from the same group.
function buildItems(level) {
  const n = choicesForLevel(level);
  const pool = level === 1 ? SHAPES.slice(0, 6) : SHAPES;
  return shuffle(pool).slice(0, 6).map((target, i) => {
    const similar = SHAPES.filter((s) => s.name !== target.name && s.group === target.group);
    const different = SHAPES.filter((s) => s.group !== target.group);
    const source = level >= 3 && similar.length >= n - 1 ? similar : level === 1 ? different : SHAPES.filter((s) => s.name !== target.name);
    const distractors = shuffle(source).slice(0, n - 1);
    const Shadow = Icons[target.icon];
    return {
      id: target.name,
      prompt: "Which shape fits the shadow?",
      visual: <Shadow size={150} fill="#3D5468" color="#3D5468" strokeWidth={1} aria-label="A shape's shadow" />,
      choices: shuffle([target, ...distractors]).map((s, j) => {
        const Icon = Icons[s.icon];
        const color = SHAPE_COLORS[(i + j) % SHAPE_COLORS.length];
        return {
          id: s.name,
          label: s.name,
          correct: s.name === target.name,
          showLabel: false,
          render: <Icon size={84} fill={color} color={color} strokeWidth={1} aria-hidden />,
        };
      }),
    };
  });
}

export default function PuzzleGame() {
  return (
    <QuizGame
      moduleCode="puzzle"
      title="Shape Puzzles"
      skill="Cognitive"
      buildItems={buildItems}
      introText="Find the shape that fits the shadow."
    />
  );
}
