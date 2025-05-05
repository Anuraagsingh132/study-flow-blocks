
import React from "react";
import { StudyBlock } from "@/types";
import StudyBlockCard from "@/components/StudyBlockCard";
import { CalendarIcon, Clock, ListTodo } from "lucide-react";

interface StudyBlockListProps {
  blocks: StudyBlock[];
  loading: boolean;
  emptyState: "today" | "tomorrow" | "week";
  onToggleCompletion: (block: StudyBlock, completed: boolean) => void;
  onBlockUpdated: () => Promise<void>;
}

const StudyBlockList: React.FC<StudyBlockListProps> = ({
  blocks,
  loading,
  emptyState,
  onToggleCompletion,
  onBlockUpdated,
}) => {
  // Get the appropriate empty state content based on the tab
  const getEmptyStateContent = () => {
    switch (emptyState) {
      case "today":
        return {
          icon: <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />,
          title: "No study blocks for today",
          description: "Add your first study block to get started",
        };
      case "tomorrow":
        return {
          icon: <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />,
          title: "No study blocks for tomorrow",
          description: "Plan ahead by adding study blocks",
        };
      case "week":
        return {
          icon: <ListTodo className="mx-auto h-12 w-12 text-gray-300 mb-3" />,
          title: "No study blocks for this week",
          description: "Start planning your study schedule",
        };
    }
  };

  const emptyContent = getEmptyStateContent();

  if (loading) {
    return (
      <div className="flex justify-center my-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8">
        {emptyContent.icon}
        <h3 className="text-lg font-medium text-gray-600 mb-1">{emptyContent.title}</h3>
        <p className="text-gray-500 mb-4">{emptyContent.description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map(block => (
        <StudyBlockCard
          key={block.id}
          block={block}
          onToggleCompletion={(completed) => onToggleCompletion(block, completed)}
          onBlockUpdated={onBlockUpdated}
        />
      ))}
    </div>
  );
};

export default StudyBlockList;
