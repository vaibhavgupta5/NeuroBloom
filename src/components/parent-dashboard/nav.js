import { BarChart3, HeartPulse, Home, Radio, Settings, Users } from "lucide-react";

export const PARENT_TABS = [
  { id: "overview", label: "Today", icon: Home },
  { id: "live", label: "Live", icon: Radio },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "wellbeing", label: "Wellbeing", icon: HeartPulse },
  { id: "care", label: "Care team", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];
