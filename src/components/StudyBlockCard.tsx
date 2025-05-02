
import React from "react";
import { Clock, Flag, Check } from "lucide-react";
import { StudyBlock } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface StudyBlockCardProps {
  block: StudyBlock;
  onToggleCompletion: (id: string) => void;
}

const StudyBlockCard: React.FC<StudyBlockCardProps> = ({
  block,
  onToggleCompletion,
}) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      default:
        return "priority-low";
    }
  };

  return (
    <div 
      className={cn(
        "study-block",
        block.completed && "opacity-60"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", block.id);
        e.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("dragging");
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{block.subject}</h3>
          <p className="text-sm text-gray-500">{block.topic}</p>
        </div>
        <span 
          className={cn(
            "text-xs px-2 py-1 rounded-full", 
            getPriorityClass(block.priority)
          )}
        >
          <Flag className="inline-block w-3 h-3 mr-1" />
          {block.priority.charAt(0).toUpperCase() + block.priority.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
        <Clock className="w-4 h-4" />
        <span>{block.startTime} - {block.endTime}</span>
      </div>
      
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <Checkbox
            id={`complete-${block.id}`}
            checked={block.completed}
            onCheckedChange={() => onToggleCompletion(block.id)}
            className="mr-2"
          />
          <label
            htmlFor={`complete-${block.id}`}
            className="text-sm cursor-pointer"
          >
            {block.completed ? "Completed" : "Mark complete"}
          </label>
        </div>
        <button className="text-primary text-sm hover:underline">
          Edit
        </button>
      </div>
    </div>
  );
};

export default StudyBlockCard;
