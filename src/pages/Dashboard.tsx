
import React, { useEffect, useState } from "react";
import { getStudyBlocks, createStudyBlock, updateStudyBlock } from "@/services/supabase/studyBlocks";
import { StudyBlock } from "@/types";
import { toast } from "sonner";
import { isSameDay, parseISO, addDays } from "date-fns";
import { useAuth } from "@/context/AuthContext";

// Import refactored components
import StudySuggestionsWidget from "@/components/StudySuggestionsWidget";
import AddBlockButton from "@/components/AddBlockButton";
import FeatureToolsRow from "@/components/dashboard/FeatureToolsRow";
import StudySchedule from "@/components/dashboard/StudySchedule";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const Dashboard = () => {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("today");
  const [showCompanion, setShowCompanion] = useState(true);

  useEffect(() => {
    loadBlocks();
  }, [selectedDate, user]);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      
      // Get blocks for the selected date
      const blocksData = await getStudyBlocks(selectedDate);
      
      // Sort by start time
      const sortedBlocks = [...blocksData].sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      
      setBlocks(sortedBlocks);
    } catch (error) {
      console.error("Error loading study blocks:", error);
      toast.error("Failed to load study blocks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (blockType: string, data: any) => {
    try {
      // Format times to ISO string
      const newBlock = await createStudyBlock({
        subject: data.subject,
        topic: data.topic,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        priority: data.priority,
      });
      
      // Only add to the current view if the dates match
      if (isSameDay(parseISO(newBlock.startTime), selectedDate)) {
        setBlocks([...blocks, newBlock]);
      }
      
      toast.success("Study block added successfully");
    } catch (error) {
      console.error("Error adding study block:", error);
      toast.error("Failed to add study block");
    }
  };

  const handleToggleCompletion = async (block: StudyBlock, completed: boolean) => {
    try {
      await updateStudyBlock(block.id, { completed });
      
      // Update local state
      setBlocks(blocks.map(b => 
        b.id === block.id ? { ...b, completed } : b
      ));
      
      toast.success(completed ? "Study block completed!" : "Study block marked incomplete");
    } catch (error) {
      console.error("Error updating study block:", error);
      toast.error("Failed to update study block");
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    // Open AddBlockButton with pre-filled data based on suggestion
    // Implementation would depend on how AddBlockButton is designed
    toast.info(`Selected suggestion: ${suggestion.title}`);
  };
  
  const handleDateChange = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case "today":
        setSelectedDate(new Date());
        break;
      case "tomorrow":
        setSelectedDate(addDays(new Date(), 1));
        break;
      case "thisWeek":
        setSelectedDate(new Date()); // This would be a special case handled in the view
        break;
      default:
        setSelectedDate(new Date());
    }
  };

  const getBlocksForCurrentView = () => {
    if (activeTab !== "thisWeek") {
      return blocks;
    }
    
    // For "This Week" tab, we'd want to show blocks for the whole week
    // In a real implementation, you'd fetch blocks for the entire week
    return blocks;
  };

  const visibleBlocks = getBlocksForCurrentView();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Feature Tools Row */}
      <FeatureToolsRow />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area - study blocks */}
        <div className="md:col-span-2">
          {/* Study blocks section */}
          <StudySchedule 
            blocks={visibleBlocks}
            loading={loading}
            activeTab={activeTab}
            onDateChange={handleDateChange}
            onAddBlock={handleAddBlock}
            onToggleCompletion={handleToggleCompletion}
            onBlockUpdated={loadBlocks}
          />
          
          {/* Smart Study Suggestions */}
          <StudySuggestionsWidget 
            className="mb-6" 
            onSelectSuggestion={handleSuggestionSelect}
            limit={3}
          />
        </div>
        
        {/* Sidebar */}
        <DashboardSidebar 
          showCompanion={showCompanion}
          setShowCompanion={setShowCompanion}
        />
      </div>
      
      {/* Floating Add Button for mobile */}
      <div className="md:hidden">
        <AddBlockButton onAddBlock={handleAddBlock} />
      </div>
    </div>
  );
};

export default Dashboard;
