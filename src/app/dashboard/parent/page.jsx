"use client";

import ParentLayout from "../../../components/parent-dashboard/ParentLayout";
import HeaderBar from "../../../components/parent-dashboard/HeaderBar";
import StatsRow from "../../../components/parent-dashboard/StatsRow";
import ActivityTimeline from "../../../components/parent-dashboard/ActivityTimeline";
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
import { useParentStore } from "../../../stores/useParentStore";

import { motion, AnimatePresence } from "framer-motion";

export default function ParentDashboardPage() {
  const { activeTab, liveSession } = useParentStore();

  const renderContent = () => {
    switch (activeTab) {
      case "live":
        return <UnifiedTelemetryHUD />;
      case "overview":
        return (
          <>
            {liveSession?.isLive && <LiveObserverBanner />}
            <StatsRow />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityTimeline />
              </div>
              <div>
                <TherapistNotes />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodChart />
              <ConcentrationChart />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <CategoryTimeChart />
              <SkillBars />
            </div>
            
            <div className="mt-6">
              <PromptDependency />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              <UpcomingModules />
              <Achievements />
            </div>
          </>
        );
      case "progress":
        return (
          <div className="space-y-6 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VocabularyGrowthChart />
              <CompletionRateChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConcentrationChart />
              <CategoryTimeChart />
            </div>
            <SkillBars />
            <PromptDependency />
            <Achievements />
          </div>
        );
      case "mood":
        return (
          <div className="space-y-6 pb-12">
            <MoodChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SleepMoodChart />
              <BehavioralLogChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConcentrationChart />
              <CategoryTimeChart />
            </div>
          </div>
        );
      case "sessions":
        return (
          <div className="space-y-6 pb-12">
            {liveSession?.isLive && <LiveObserverBanner />}
            <ActivityTimeline />
            <UpcomingModules />
          </div>
        );
      case "notes":
        return (
          <div className="space-y-6 pb-12 max-w-2xl">
            <TherapistNotes />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6 pb-12 max-w-4xl mx-auto">
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
