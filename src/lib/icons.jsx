import {
  Apple, Bath, Bed, BookOpen, Bus, Car, CircleHelp, Cookie, Droplet, Footprints, Gamepad2, GlassWater,
  Hand, Heart, Home, Music, Moon, Palette, Pizza, School, Shirt, Smile, Sparkles, Star, Sun, TreePine,
  Tv, Utensils, Users, Puzzle, Bike, Toilet, Volume2, ThumbsUp, ThumbsDown, Plus, OctagonX, Frown,
  Angry, Laugh, HelpingHand, Baby, Dog, IceCreamCone,
} from "lucide-react";

// Picture symbols shared by routines, the Talk board and the routine editor.
export const ICONS = {
  sun: Sun, moon: Moon, bed: Bed, bath: Bath, toilet: Toilet, droplet: Droplet, smile: Smile, shirt: Shirt,
  utensils: Utensils, apple: Apple, cookie: Cookie, pizza: Pizza, water: GlassWater, icecream: IceCreamCone,
  gamepad: Gamepad2, puzzle: Puzzle, book: BookOpen, music: Music, tv: Tv, palette: Palette, bike: Bike,
  park: TreePine, walk: Footprints, car: Car, bus: Bus, school: School, home: Home, family: Users,
  heart: Heart, star: Star, sparkles: Sparkles, hand: Hand, dog: Dog, baby: Baby,
  yes: ThumbsUp, no: ThumbsDown, more: Plus, stop: OctagonX, help: HelpingHand, question: CircleHelp,
  happy: Laugh, sad: Frown, angry: Angry, loud: Volume2,
};

export const ROUTINE_ICON_CHOICES = ["sun", "toilet", "smile", "shirt", "utensils", "book", "school", "bus", "car", "park", "gamepad", "tv", "music", "bath", "bed", "moon", "puzzle", "family"];

export function IconFor({ name, ...props }) {
  const Icon = ICONS[name] || Star;
  return <Icon aria-hidden {...props} />;
}
