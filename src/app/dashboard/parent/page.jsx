"use client";

import ParentLayout from "../../../components/parent-dashboard/ParentLayout";
import HeaderBar from "../../../components/parent-dashboard/HeaderBar";
import StatsRow from "../../../components/parent-dashboard/StatsRow";
import ActivityTimeline from "../../../components/parent-dashboard/ActivityTimeline";
import SessionEmotionSummary from "../../../components/parent-dashboard/SessionEmotionSummary";
import TherapistNotes from "../../../components/parent-dashboard/TherapistNotes";
import MoodChart from "../../../components/parent-dashboard/MoodChart";
import SkillBars from "../../../components/parent-dashboard/SkillBars";
import PromptDependency from "../../../components/parent-dashboard/PromptDependency";
import UpcomingModules from "../../../components/parent-dashboard/UpcomingModules";
import Achievements from "../../../components/parent-dashboard/Achievements";
import SettingsPanel from "../../../components/parent-dashboard/SettingsPanel";
import ConcentrationChart from "../../../components/parent-dashboard/ConcentrationChart";
import CategoryTimeChart from "../../../components/parent-dashboard/CategoryTimeChart";
import BehavioralLogChart from "../../../components/parent-dashboard/BehavioralLogChart";
import VocabularyGrowthChart from "../../../components/parent-dashboard/VocabularyGrowthChart";
import CompletionRateChart from "../../../components/parent-dashboard/CompletionRateChart";
import SleepMoodChart from "../../../components/parent-dashboard/SleepMoodChart";
import ClinicalReports from "../../../components/parent-dashboard/ClinicalReports";
import LiveObserverBanner from "../../../components/parent-dashboard/live/LiveObserverBanner";
import UnifiedTelemetryHUD from "../../../components/parent-dashboard/live/UnifiedTelemetryHUD";
import DailyGoalRing from "../../../components/parent-dashboard/DailyGoalRing";
import { useParentStore } from "../../../stores/useParentStore";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useLiveSession } from "../../../hooks/useLiveSession";

import { motion, AnimatePresence } from "framer-motion";

export default function ParentDashboardPage() {
  const { activeTab, liveSession } = useParentStore();

  // Server data + SSE live telemetry
  useDashboardData();
  useLiveSession();

  const renderContent = () => {
    switch (activeTab) {
      case "live":
        return <UnifiedTelemetryHUD />;
      case "overview":
        return (
          <div className="space-y-6 md:space-y-8 pb-12">
            {liveSession?.isLive && <LiveObserverBanner />}
            <DailyGoalRing />
            <StatsRow />
            
            {/* Timeline + Therapist Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 flex flex-col h-full">
                <ActivityTimeline />
              </div>
              <div className="lg:col-span-1 flex flex-col h-full">
                <TherapistNotes />
              </div>
            </div>

            {/* After-game camera emotion insights */}
            <SessionEmotionSummary />
            
            {/* Mood + Concentration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <MoodChart />
              </div>
              <div className="flex flex-col h-full">
                <ConcentrationChart />
              </div>
            </div>
            
            {/* Category Time + Skill Development */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <CategoryTimeChart />
              </div>
              <div className="flex flex-col h-full">
                <SkillBars />
              </div>
            </div>
            
            {/* Independence Growth */}
            <div>
              <PromptDependency />
            </div>
            
            {/* Recommended Modules + Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <UpcomingModules />
              </div>
              <div className="flex flex-col h-full">
                <Achievements />
              </div>
            </div>
          </div>
        );
      case "progress":
        return (
          <div className="space-y-6 md:space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <VocabularyGrowthChart />
              </div>
              <div className="flex flex-col h-full">
                <CompletionRateChart />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <ConcentrationChart />
              </div>
              <div className="flex flex-col h-full">
                <CategoryTimeChart />
              </div>
            </div>
            <SkillBars />
            <PromptDependency />
            <Achievements />
          </div>
        );
      case "mood":
        return (
          <div className="space-y-6 md:space-y-8 pb-12">
            <MoodChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <SleepMoodChart />
              </div>
              <div className="flex flex-col h-full">
                <BehavioralLogChart />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <ConcentrationChart />
              </div>
              <div className="flex flex-col h-full">
                <CategoryTimeChart />
              </div>
            </div>
          </div>
        );
      case "sessions":
        return (
          <div className="space-y-6 md:space-y-8 pb-12">
            {liveSession?.isLive && <LiveObserverBanner />}
            <ActivityTimeline />
            <UpcomingModules />
          </div>
        );
      case "notes":
        return (
          <div className="space-y-6 md:space-y-8 pb-12 max-w-3xl">
            <TherapistNotes />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6 md:space-y-8 pb-12 max-w-4xl mx-auto">
            <ClinicalReports />
          </div>
        );
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <ParentLayout>
      <HeaderBar />
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </ParentLayout>
  );
}
