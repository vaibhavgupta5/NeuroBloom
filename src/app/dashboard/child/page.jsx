"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useChildStore } from "../../../stores/useChildStore";
import { useChildState } from "../../../hooks/useChildState";
import { useParentActionListener } from "../../../hooks/useParentActionListener";
import ChildLayout from "../../../components/child-dashboard/ChildLayout";
import HomeScreen from "../../../components/child-dashboard/screens/HomeScreen";
import PlayScreen from "../../../components/child-dashboard/screens/PlayScreen";
import StarsScreen from "../../../components/child-dashboard/screens/StarsScreen";
import ScheduleScreen from "../../../components/child-dashboard/screens/ScheduleScreen";
import FeelScreen from "../../../components/child-dashboard/screens/FeelScreen";
import TalkScreen from "../../../components/child-dashboard/screens/TalkScreen";
import CameraEmotionBadge from "../../../components/child-dashboard/CameraEmotionBadge";
import { CameraEmotionProvider } from "../../../context/CameraEmotionContext";

const screens = {
  home: <HomeScreen />,
  play: <PlayScreen />,
  talk: <TalkScreen />,
  stars: <StarsScreen />,
  schedule: <ScheduleScreen />,
  feel: <FeelScreen />,
};

export default function ChildDashboardPage() {
  const activeScreen = useChildStore((s) => s.activeScreen);
  const activeGame = useChildStore((s) => s.activeGame);
  const consent = useChildStore((s) => s.child.consent);

  // Server data + realtime parent interventions
  useChildState();
  useParentActionListener();

  return (
    <CameraEmotionProvider consent={consent}>
      <ChildLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame ? `game:${activeScreen}` : activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full relative"
          >
            {screens[activeScreen] || <HomeScreen />}
          </motion.div>
        </AnimatePresence>

        <CameraEmotionBadge />
      </ChildLayout>
    </CameraEmotionProvider>
  );
}
