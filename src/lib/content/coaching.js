// "Try this at home" activities for caregivers, modelled on parent-mediated
// naturalistic developmental behavioural strategies (e.g. JASPER, ESDM):
// follow the child's lead, imitate and expand, set up communication
// opportunities, and keep routines predictable.
export const COACHING = [
  {
    id: "emo-mirror-faces",
    skill: "Emotions",
    title: "Mirror faces at snack time",
    minutes: 5,
    steps: [
      "Sit face to face at your child's eye level.",
      "Make one clear, big expression (happy or surprised) and name it.",
      "Pause and wait. If your child copies you, copy them back and smile.",
    ],
    why: "Face-to-face imitation builds joint attention and emotion recognition.",
  },
  {
    id: "emo-feelings-story",
    skill: "Emotions",
    title: "Name feelings in a picture book",
    minutes: 10,
    steps: [
      "Pick a book with clear faces.",
      "Point to a face and say the feeling in one or two words: \"She's sad.\"",
      "Ask \"Show me happy\" and let your child point. Praise any attempt.",
    ],
    why: "Short, concrete labels connect a facial expression to a word.",
  },
  {
    id: "comm-sabotage",
    skill: "Communication",
    title: "Create a reason to ask",
    minutes: 5,
    steps: [
      "Put a favourite toy or snack in a clear container your child can't open.",
      "Wait with an expectant look — count to 10 in your head.",
      "Accept any request (word, sign, Talk-board tile, pointing), then hand it over.",
    ],
    why: "Communication temptations give your child a real reason to initiate.",
  },
  {
    id: "comm-expand",
    skill: "Communication",
    title: "Say it back, one word longer",
    minutes: 10,
    steps: [
      "During play, listen for any word or sound your child makes.",
      "Repeat it and add one word: \"car\" → \"red car\".",
      "Don't ask them to repeat — just model and keep playing.",
    ],
    why: "Expanding by one step models the next level without pressure.",
  },
  {
    id: "cog-sort-laundry",
    skill: "Cognitive",
    title: "Sort socks together",
    minutes: 10,
    steps: [
      "Put a small pile of socks between you.",
      "Find one pair and say \"Same!\" as you put them together.",
      "Hand your child one sock and wait for them to find its match.",
    ],
    why: "Matching in a real routine helps the skill carry over from the game.",
  },
  {
    id: "att-bubble-track",
    skill: "Attention",
    title: "Bubble tracking",
    minutes: 5,
    steps: [
      "Blow a few bubbles slowly in front of your child.",
      "Point to one and say \"Look!\" then pop it together.",
      "Stop after 5 minutes, while it's still fun.",
    ],
    why: "Following a moving target with a shared focus builds visual attention.",
  },
  {
    id: "social-turns",
    skill: "Social",
    title: "Tower turn-taking",
    minutes: 10,
    steps: [
      "Build a block tower together.",
      "Say \"My turn\" and add one block, then \"Your turn\" and wait.",
      "Celebrate the tower falling — then build again.",
    ],
    why: "Simple, repeated turn-taking games are a core joint-engagement routine.",
  },
  {
    id: "reg-breathing",
    skill: "Regulation",
    title: "Practice calm breathing when calm",
    minutes: 3,
    steps: [
      "Open Calm Corner together when your child is already relaxed.",
      "Breathe with the circle: in as it grows, out as it shrinks.",
      "Do 3 breaths, then stop. Practising when calm makes it easier to use when upset.",
    ],
    why: "Regulation strategies are learned best outside of a meltdown.",
  },
];

/** Deterministic pick: one activity per day, favouring the skills with active goals. */
export function pickCoaching(dayKey, preferredSkills = []) {
  const pool = preferredSkills.length
    ? COACHING.filter((a) => preferredSkills.includes(a.skill))
    : COACHING;
  const list = pool.length ? pool : COACHING;
  const seed = [...dayKey].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return list[seed % list.length];
}
