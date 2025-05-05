
import React from "react";
import { Button } from "@/components/ui/button";
import StudyCompanionWidget from "@/components/StudyCompanionWidget";

interface DashboardSidebarProps {
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  showCompanion,
  setShowCompanion,
}) => {
  return (
    <div className="space-y-6">
      {showCompanion ? (
        <StudyCompanionWidget 
          minimized={false} 
          onMaximize={() => setShowCompanion(true)} 
        />
      ) : (
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={() => setShowCompanion(true)}
        >
          Show Study Companion
        </Button>
      )}
    </div>
  );
};

export default DashboardSidebar;
