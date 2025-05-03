
import React from "react";
import { Clock, CircleCheck, CalendarClock, BookOpen, AlertTriangle, Music } from "lucide-react";
import { StudyBlock } from "@/types";
import { format, parseISO, isToday } from "date-fns";

interface StudyBlockCardProps {
  block: StudyBlock;
  onToggleCompletion: (completed: boolean) => void;
}

const StudyBlockCard: React.FC<StudyBlockCardProps> = ({ block, onToggleCompletion }) => {
  // Format the date and time
  const formatTimeRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const startTime = format(startDate, "h:mm a");
    const endTime = format(endDate, "h:mm a");

    if (isToday(startDate)) {
      return `Today, ${startTime} - ${endTime}`;
    } else {
      return `${format(startDate, "MMM dd")}, ${startTime} - ${endTime}`;
    }
  };

  // Calculate duration in hours and minutes
  const getDuration = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (durationHours === 0) {
      return `${durationMinutes} min`;
    } else if (durationMinutes === 0) {
      return `${durationHours} ${durationHours === 1 ? "hour" : "hours"}`;
    } else {
      return `${durationHours} ${durationHours === 1 ? "hour" : "hours"} ${durationMinutes} min`;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        block.completed ? "border-green-200 bg-green-50" : "border-gray-200"
      } p-5 hover:shadow-md transition-all relative`}
    >
      {block.completed && (
        <div className="absolute top-3 right-3 text-green-600">
          <CircleCheck className="h-6 w-6" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            block.completed ? "bg-green-200 text-green-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{block.subject}</h3>
          <p className="text-sm text-gray-600">{block.topic}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarClock className="h-4 w-4 mr-2 text-gray-400" />
          {formatTimeRange(block.startTime, block.endTime)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          {getDuration(block.startTime, block.endTime)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(block.priority)}`}
        >
          {block.priority.charAt(0).toUpperCase() + block.priority.slice(1)} Priority
        </span>

        <button
          onClick={() => onToggleCompletion(!block.completed)}
          className={`px-3 py-1 rounded-md text-sm ${
            block.completed
              ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {block.completed ? "Undo" : "Complete"}
        </button>
      </div>
    </div>
  );
};

export default StudyBlockCard;
