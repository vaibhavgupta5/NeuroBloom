"use client";

import { useParentStore } from "../../../stores/useParentStore";
import { FocusChart, TimePerSkillChart, VocabularyChart } from "../charts";
import ActivityTimeline from "../ActivityTimeline";
import SessionEmotionSummary from "../SessionEmotionSummary";
import Achievements from "../Achievements";

export default function Progress() {
  const { concentrationData, categoryTimeData, vocabularyData, completionData, stats } = useParentStore();
  const finished = completionData.find((d) => d.name === "Finished")?.value;
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="grid lg:grid-cols-3 gap-6">
        <TimePerSkillChart data={categoryTimeData} />
        <section className="card p-6 flex flex-col justify-between">
          <h2 className="font-nunito font-bold text-lg text-ink">Finished activities</h2>
          <div>
            <p className="font-sora text-4xl font-semibold text-ink tabular mt-4">{finished ?? 0}%</p>
            <p className="font-dm-sans text-sm text-ink-soft mt-1">of {stats.totalModules} started activities in the last 4 weeks were finished. Stopping early is fine — it tells you when a break is needed.</p>
          </div>
        </section>
        <VocabularyChart data={vocabularyData} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <ActivityTimeline />
        <FocusChart data={concentrationData} />
      </div>
      <SessionEmotionSummary />
      <Achievements />
    </div>
  );
}
