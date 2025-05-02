
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import StudyBlockCard from "@/components/StudyBlockCard";
import AddBlockButton from "@/components/AddBlockButton";
import { StudyBlock, Goal } from "@/types";
import { generateSampleBlocks, generateSampleGoals } from "@/utils/sample-data";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [date, setDate] = useState(new Date());
  
  useEffect(() => {
    // Load sample data
    setStudyBlocks(generateSampleBlocks());
    setGoals(generateSampleGoals());
  }, []);
  
  const handleToggleCompletion = (id: string) => {
    setStudyBlocks((blocks) =>
      blocks.map((block) =>
        block.id === id ? { ...block, completed: !block.completed } : block
      )
    );
    
    toast.success("Status updated successfully!");
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
    // Here you would implement reordering logic
    toast.info("Reordering is supported in the full version");
  };
  
  const handleAddBlock = (blockType: string, data: any) => {
    if (blockType === "study") {
      const newBlock: StudyBlock = {
        id: Math.random().toString(36).substring(2, 10),
        subject: data.subject,
        topic: data.topic,
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority,
        completed: false
      };
      
      setStudyBlocks((blocks) => [...blocks, newBlock]);
      toast.success("Study block added successfully!");
    }
    // You would also handle other block types here
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{format(date, "EEEE, MMMM d")}</h1>
          <p className="text-gray-500">Here's what you have planned for today</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Pick date
        </Button>
      </div>
      
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
          <div className="text-sm">
            <p className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Math test</span>
              <span className="text-gray-400">Tomorrow</span>
            </p>
            <p className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Physics lab</span>
              <span className="text-gray-400">In 3 days</span>
            </p>
            <p className="flex justify-between py-1">
              <span className="text-gray-600">History paper</span>
              <span className="text-gray-400">In 5 days</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Active Goals</h3>
          {goals.slice(0, 2).map((goal) => (
            <div key={goal.id} className="mb-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.title}</span>
                <span className="text-gray-500">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-1.5 mt-1" />
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            <Plus className="h-3 w-3 mr-1" />
            View all goals
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="daily" className="mb-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="daily" onClick={() => setView("daily")}>Daily</TabsTrigger>
            <TabsTrigger value="weekly" onClick={() => setView("weekly")}>Weekly</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add task
          </Button>
        </div>
        
        <TabsContent value="daily" className="mt-4">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {studyBlocks.map((block) => (
              <StudyBlockCard
                key={block.id}
                block={block}
                onToggleCompletion={handleToggleCompletion}
              />
            ))}
          </div>
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
      
      <AddBlockButton onAddBlock={handleAddBlock} />
    </div>
  );
};

export default Dashboard;
