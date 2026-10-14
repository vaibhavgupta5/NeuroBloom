// Item banks for the three matching games, graded into 3 levels.
// level → number of choices: 1 → 2, 2 → 3, 3 → 4.

export const EMOTION_WORDS = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  scared: "scared",
  surprised: "surprised",
  calm: "calm",
};

// Level 1: big, clear faces among the three core feelings.
// Level 2: adds scared and surprised. Level 3: softer faces, all six.
export const EMOTION_LEVELS = {
  1: { pool: ["happy", "sad", "angry"], intensity: ["high"] },
  2: { pool: ["happy", "sad", "angry", "scared", "surprised"], intensity: ["high"] },
  3: { pool: ["happy", "sad", "angry", "scared", "surprised", "calm"], intensity: ["high", "low"] },
};

export const WORDS = [
  { word: "cat", icon: "Cat", category: "animals" },
  { word: "dog", icon: "Dog", category: "animals" },
  { word: "fish", icon: "Fish", category: "animals" },
  { word: "bird", icon: "Bird", category: "animals" },
  { word: "rabbit", icon: "Rabbit", category: "animals" },
  { word: "turtle", icon: "Turtle", category: "animals" },
  { word: "snail", icon: "Snail", category: "animals" },
  { word: "apple", icon: "Apple", category: "food" },
  { word: "banana", icon: "Banana", category: "food" },
  { word: "carrot", icon: "Carrot", category: "food" },
  { word: "cookie", icon: "Cookie", category: "food" },
  { word: "pizza", icon: "Pizza", category: "food" },
  { word: "ice cream", icon: "IceCreamCone", category: "food" },
  { word: "egg", icon: "Egg", category: "food" },
  { word: "grapes", icon: "Grape", category: "food" },
  { word: "car", icon: "Car", category: "vehicles" },
  { word: "bus", icon: "Bus", category: "vehicles" },
  { word: "bike", icon: "Bike", category: "vehicles" },
  { word: "plane", icon: "Plane", category: "vehicles" },
  { word: "boat", icon: "Ship", category: "vehicles" },
  { word: "train", icon: "TrainFront", category: "vehicles" },
  { word: "truck", icon: "Truck", category: "vehicles" },
  { word: "bed", icon: "Bed", category: "home" },
  { word: "bath", icon: "Bath", category: "home" },
  { word: "sofa", icon: "Sofa", category: "home" },
  { word: "lamp", icon: "Lamp", category: "home" },
  { word: "book", icon: "Book", category: "home" },
  { word: "cup", icon: "CupSoda", category: "home" },
  { word: "shirt", icon: "Shirt", category: "home" },
  { word: "umbrella", icon: "Umbrella", category: "home" },
  { word: "sun", icon: "Sun", category: "outside" },
  { word: "moon", icon: "Moon", category: "outside" },
  { word: "tree", icon: "TreePine", category: "outside" },
  { word: "flower", icon: "Flower", category: "outside" },
  { word: "cloud", icon: "Cloud", category: "outside" },
  { word: "snow", icon: "Snowflake", category: "outside" },
];

// Shapes ordered by how easy they are to tell apart; level 3 uses look-alikes.
export const SHAPES = [
  { name: "circle", icon: "Circle", group: "round" },
  { name: "square", icon: "Square", group: "corner" },
  { name: "triangle", icon: "Triangle", group: "point" },
  { name: "star", icon: "Star", group: "point" },
  { name: "heart", icon: "Heart", group: "round" },
  { name: "moon", icon: "Moon", group: "round" },
  { name: "cloud", icon: "Cloud", group: "round" },
  { name: "diamond", icon: "Diamond", group: "corner" },
  { name: "hexagon", icon: "Hexagon", group: "corner" },
  { name: "octagon", icon: "Octagon", group: "corner" },
  { name: "pentagon", icon: "Pentagon", group: "corner" },
  { name: "leaf", icon: "Leaf", group: "point" },
];

export const SHAPE_COLORS = ["#17977F", "#2B6CB0", "#E59400", "#7C66D9", "#D9603F"];

export const choicesForLevel = (level) => Math.min(4, Math.max(2, level + 1));

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
