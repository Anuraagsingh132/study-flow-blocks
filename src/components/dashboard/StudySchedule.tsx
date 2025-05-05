
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddBlockButton from "@/components/AddBlockButton";
import StudyBlockList from "@/components/dashboard/StudyBlockList";
import { StudyBlock } from "@/types";

interface StudyScheduleProps {
  blocks: StudyBlock[];
  loading: boolean;
  activeTab: string;
  onDateChange: (tab: string) => void;
  onAddBlock: (blockType: string, data: any) => void;
  onToggleCompletion: (block: StudyBlock, completed: boolean) => void;
  onBlockUpdated: () => Promise<void>;
}

const StudySchedule: React.FC<StudyScheduleProps> = ({
  blocks,
  loading,
  activeTab,
  onDateChange,
  onAddBlock,
  onToggleCompletion,
  onBlockUpdated,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Study Schedule</h2>
        <AddBlockButton onAddBlock={onAddBlock} displayAsButton={true} />
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={onDateChange}>
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="thisWeek">This Week</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="today" className="m-0">
          <div className="p-4">
            <StudyBlockList
              blocks={blocks}
              loading={loading}
              emptyState="today"
              onToggleCompletion={onToggleCompletion}
              onBlockUpdated={onBlockUpdated}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="tomorrow" className="m-0">
          <div className="p-4">
            <StudyBlockList
              blocks={blocks}
              loading={loading}
              emptyState="tomorrow"
              onToggleCompletion={onToggleCompletion}
              onBlockUpdated={onBlockUpdated}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="thisWeek" className="m-0">
          <div className="p-4">
            <StudyBlockList
              blocks={blocks}
              loading={loading}
              emptyState="week"
              onToggleCompletion={onToggleCompletion}
              onBlockUpdated={onBlockUpdated}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudySchedule;
