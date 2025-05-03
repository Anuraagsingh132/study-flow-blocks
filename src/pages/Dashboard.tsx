
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import StudyBlockCard from "@/components/StudyBlockCard";
import AddBlockButton from "@/components/AddBlockButton";
import { StudyBlock, Goal } from "@/types";
import { getStudyBlocks, toggleStudyBlockCompletion, createStudyBlock } from "@/services/supabase/studyBlocks";
import { getGoals } from "@/services/supabase/goals";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Dashboard: React.FC = () => {
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [blocksData, goalsData] = await Promise.all([
        getStudyBlocks(date),
        getGoals()
      ]);
      
      setStudyBlocks(blocksData);
      setGoals(goalsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleCompletion = async (id: string, completed: boolean) => {
    try {
      await toggleStudyBlockCompletion(id, completed);
      
      setStudyBlocks((blocks) =>
        blocks.map((block) =>
          block.id === id ? { ...block, completed } : block
        )
      );
      
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating study block status:", error);
      toast.error("Failed to update status");
    }
  };
  
  const completedBlocksCount = studyBlocks.filter((block) => block.completed).length;
  const completionPercentage = studyBlocks.length > 0
    ? Math.round((completedBlocksCount / studyBlocks.length) * 100)
    : 0;
    
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    toast.info("Reordering is supported in the full version");
  };
  
  const handleAddBlock = async (blockType: string, data: any) => {
    if (blockType === "study") {
      try {
        const newBlock = await createStudyBlock({
          subject: data.subject,
          topic: data.topic,
          start_time: data.startTime,
          end_time: data.endTime,
          priority: data.priority,
          completed: false
        });
        
        setStudyBlocks((blocks) => [...blocks, newBlock]);
        toast.success("Study block added successfully!");
      } catch (error) {
        console.error("Error adding study block:", error);
        toast.error("Failed to add study block");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{format(date, "EEEE, MMMM d")}</h1>
          <p className="text-gray-500">Here's what you have planned for today</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Pick date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Today's Progress</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center text-lg font-bold text-primary">
                  {completionPercentage}%
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {completedBlocksCount} of {studyBlocks.length} tasks completed
                  </p>
                  <Progress value={completionPercentage} className="h-2 mt-1" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Upcoming</h3>
              {goals.length > 0 ? (
                <div className="text-sm">
                  {goals.slice(0, 3).map((goal, index) => (
                    <p key={goal.id} className={`flex justify-between py-1 ${
                      index < goals.slice(0, 3).length - 1 ? "border-b border-gray-100" : ""
                    }`}>
                      <span className="text-gray-600">{goal.title}</span>
                      <span className="text-gray-400">
                        {new Date(goal.deadline) > new Date() 
                          ? `In ${Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` 
                          : "Overdue"}
                      </span>
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">
                  No upcoming deadlines
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Active Goals</h3>
              {goals.filter(g => !g.completed).length > 0 ? (
                <>
                  {goals.filter(g => !g.completed).slice(0, 2).map((goal) => (
                    <div key={goal.id} className="mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-gray-500">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5 mt-1" />
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate("/goals")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    View all goals
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-500 text-center py-2">
                    No active goals
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate("/goals")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create a goal
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="daily" className="mb-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="daily" onClick={() => setView("daily")}>Daily</TabsTrigger>
                <TabsTrigger value="weekly" onClick={() => setView("weekly")}>Weekly</TabsTrigger>
              </TabsList>
              <AddBlockButton onAddBlock={handleAddBlock} />
            </div>
            
            <TabsContent value="daily" className="mt-4">
              {studyBlocks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <p className="text-gray-500 mb-4">No study blocks scheduled for this day</p>
                  <AddBlockButton onAddBlock={handleAddBlock} displayAsButton />
                </div>
              ) : (
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {studyBlocks.map((block) => (
                    <StudyBlockCard
                      key={block.id}
                      block={block}
                      onToggleCompletion={(completed) => handleToggleCompletion(block.id, completed)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-center text-gray-500">Weekly view will show your scheduled blocks for the entire week</p>
                <div className="flex justify-center mt-4">
                  <Button variant="outline">
                    Switch to calendar view
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
