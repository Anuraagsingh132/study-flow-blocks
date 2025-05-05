
import React, { useEffect, useState } from "react";
import StudyBlockCard from "@/components/StudyBlockCard";
import AddBlockButton from "@/components/AddBlockButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, ListTodo } from "lucide-react";
import { getStudyBlocks, createStudyBlock, updateStudyBlock } from "@/services/supabase/studyBlocks";
import { StudyBlock } from "@/types";
import { toast } from "sonner";
import { format, isSameDay, parseISO, isAfter, addDays } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

// New feature components
import StudySuggestionsWidget from "@/components/StudySuggestionsWidget";
import StudyCompanionWidget from "@/components/StudyCompanionWidget";
import PomodoroTimer from "@/components/PomodoroTimer";
import RevisionPlanner from "@/components/RevisionPlanner";
import AchievementWidget from "@/components/AchievementWidget";

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
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
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
      <div className="flex flex-wrap gap-2 mb-6">
        <PomodoroTimer />
        <RevisionPlanner />
        <AchievementWidget />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area - study blocks */}
        <div className="md:col-span-2">
          {/* Study blocks section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Study Schedule</h2>
              <AddBlockButton onAddBlock={handleAddBlock} displayAsButton={true} />
            </div>
            
            <Tabs defaultValue="today" onValueChange={handleDateChange}>
              <div className="px-4 pt-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                  <TabsTrigger value="thisWeek">This Week</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="today" className="m-0">
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center my-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : visibleBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {visibleBlocks.map(block => (
                        <StudyBlockCard
                          key={block.id}
                          block={block}
                          onToggleCompletion={(completed) => handleToggleCompletion(block, completed)}
                          onBlockUpdated={loadBlocks}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">No study blocks for today</h3>
                      <p className="text-gray-500 mb-4">Add your first study block to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tomorrow" className="m-0">
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center my-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : visibleBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {visibleBlocks.map(block => (
                        <StudyBlockCard
                          key={block.id}
                          block={block}
                          onToggleCompletion={(completed) => handleToggleCompletion(block, completed)}
                          onBlockUpdated={loadBlocks}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">No study blocks for tomorrow</h3>
                      <p className="text-gray-500 mb-4">Plan ahead by adding study blocks</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="thisWeek" className="m-0">
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center my-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : visibleBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {visibleBlocks.map(block => (
                        <StudyBlockCard
                          key={block.id}
                          block={block}
                          onToggleCompletion={(completed) => handleToggleCompletion(block, completed)}
                          onBlockUpdated={loadBlocks}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ListTodo className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">No study blocks for this week</h3>
                      <p className="text-gray-500 mb-4">Start planning your study schedule</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Smart Study Suggestions */}
          <StudySuggestionsWidget 
            className="mb-6" 
            onSelectSuggestion={handleSuggestionSelect}
            limit={3}
          />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Study Companion Widget */}
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
      </div>
      
      {/* Floating Add Button for mobile */}
      <div className="md:hidden">
        <AddBlockButton onAddBlock={handleAddBlock} />
      </div>
    </div>
  );
};

export default Dashboard;
