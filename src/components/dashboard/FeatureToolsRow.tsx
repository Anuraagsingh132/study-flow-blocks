
import React from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import RevisionPlanner from "@/components/RevisionPlanner";
import AchievementWidget from "@/components/AchievementWidget";

const FeatureToolsRow: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <PomodoroTimer />
      <RevisionPlanner />
      <AchievementWidget />
    </div>
  );
};

export default FeatureToolsRow;
