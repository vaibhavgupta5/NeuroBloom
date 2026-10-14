"use client";

import ParentLayout from "../../../components/parent-dashboard/ParentLayout";
import HeaderBar from "../../../components/parent-dashboard/HeaderBar";
import Overview from "../../../components/parent-dashboard/sections/Overview";
import Progress from "../../../components/parent-dashboard/sections/Progress";
import Wellbeing from "../../../components/parent-dashboard/sections/Wellbeing";
import CareTeam from "../../../components/parent-dashboard/sections/CareTeam";
import Settings from "../../../components/parent-dashboard/sections/Settings";
import LiveView from "../../../components/parent-dashboard/live/LiveView";
import { useParentStore } from "../../../stores/useParentStore";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useLiveSession } from "../../../hooks/useLiveSession";
import { Button } from "../../../components/ui/kit";

const SECTIONS = { overview: Overview, live: LiveView, progress: Progress, wellbeing: Wellbeing, care: CareTeam, settings: Settings };

export default function ParentDashboardPage() {
  const { activeTab, hydrated, loadError, reload, child } = useParentStore();
  useDashboardData();
  useLiveSession();

  const Section = SECTIONS[activeTab] || Overview;

  return (
    <ParentLayout>
      <HeaderBar />
      <div className="px-4 md:px-8 pt-2 max-w-7xl w-full">
        {!hydrated ? (
          loadError ? (
            <div className="card p-6 max-w-md">
              <p className="font-dm-sans text-ink">We couldn&apos;t load the dashboard ({loadError}).</p>
              <Button className="mt-4" onClick={reload}>Try again</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading">
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
            </div>
          )
        ) : (
          <Section key={`${activeTab}-${child.id}`} />
        )}
      </div>
    </ParentLayout>
  );
}
