import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { getStudyBlocks } from "@/services/supabase/studyBlocks";
import { getGoals } from "@/services/supabase/goals";
import { getSubjects } from "@/services/supabase/subjects";
import { toast } from "sonner";
import { addDays, format, startOfWeek, endOfWeek, differenceInDays, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const [studyHours, setStudyHours] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  
  const COLORS = ["#6B9BF2", "#F26B9B", "#9B6BF2", "#6BF29B", "#F2D16B"];

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get date range based on selected period
      const today = new Date();
      let startDate: Date;
      
      switch(period) {
        case "week":
          startDate = startOfWeek(today);
          break;
        case "month":
          startDate = addDays(today, -30);
          break;
        case "all":
        default:
          startDate = new Date(2020, 0, 1); // Far in the past
          break;
      }
      
      // Load study blocks without a specific date to get all blocks
      const blocks = await getStudyBlocks();
      const goals = await getGoals();
      const subjects = await getSubjects();
      
      // Filter blocks within date range
      const filteredBlocks = blocks.filter(block => {
        const blockDate = new Date(block.startTime);
        return blockDate >= startDate && blockDate <= today;
      });
      
      // Calculate study hours and tasks completed
      let totalHours = 0;
      filteredBlocks.forEach(block => {
        const start = new Date(block.startTime);
        const end = new Date(block.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += durationHours;
      });
      
      const completedTasks = filteredBlocks.filter(block => block.completed).length;
      
      setStudyHours(parseFloat(totalHours.toFixed(1)));
      setTasksCompleted(completedTasks);
      
      // Calculate current streak
      calculateStreak(blocks);
      
      // Generate weekly data
      generateWeeklyData(filteredBlocks);
      
      // Generate subject data
      generateSubjectData(subjects);
      
    } catch (error) {
      console.error("Error loading progress data:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStreak = (blocks: any[]) => {
    // Group blocks by day
    const blocksByDay = new Map();
    
    blocks.forEach(block => {
      const date = format(new Date(block.startTime), 'yyyy-MM-dd');
      if (!blocksByDay.has(date)) {
        blocksByDay.set(date, []);
      }
      blocksByDay.get(date).push(block);
    });
    
    // Calculate streak
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    let currentDate = today;
    
    while (blocksByDay.has(currentDate) && blocksByDay.get(currentDate).some(block => block.completed)) {
      streak++;
      currentDate = format(addDays(new Date(currentDate), -1), 'yyyy-MM-dd');
    }
    
    setCurrentStreak(streak);
  };
  
  const generateWeeklyData = (blocks: any[]) => {
    const startOfWeekDate = startOfWeek(new Date());
    const data = [];
    
    // Create a map of weekday to blocks
    const blocksByDay = new Map();
    
    blocks.forEach(block => {
      const date = format(new Date(block.startTime), 'yyyy-MM-dd');
      if (!blocksByDay.has(date)) {
        blocksByDay.set(date, []);
      }
      blocksByDay.get(date).push(block);
    });
    
    // Generate data for the past 7 days
    for (let i = 0; i < 7; i++) {
      const day = addDays(startOfWeekDate, i);
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayBlocks = blocksByDay.get(dayKey) || [];
      
      // Calculate study hours for this day
      let dayHours = 0;
      dayBlocks.forEach(block => {
        const start = new Date(block.startTime);
        const end = new Date(block.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        dayHours += durationHours;
      });
      
      // Count completed tasks
      const completedTasks = dayBlocks.filter(block => block.completed).length;
      
      data.push({
        name: format(day, 'E'), // Mon, Tue, etc.
        study: parseFloat(dayHours.toFixed(1)),
        tasks: completedTasks
      });
    }
    
    setWeeklyData(data);
  };
  
  const generateSubjectData = (subjects: any[]) => {
    // Transform subjects to pie chart data
    const data = subjects.map(subject => ({
      name: subject.name,
      value: subject.totalChapters > 0 ? subject.completedChapters : 1
    }));
    
    setSubjectData(data);
  };

  const getTrendPercentage = () => {
    // This would typically compare current period data to previous period
    // For now, returning a mock trend percentage
    return period === "week" ? 12 : period === "month" ? 5 : 18;
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Progress</h1>
          <p className="text-gray-500">Track your study habits and achievements</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={period === "week" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => setPeriod("week")}
          >
            <CalendarIcon className="h-4 w-4" />
            This Week
          </Button>
          <Button 
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
          >
            This Month
          </Button>
          <Button 
            variant={period === "all" ? "default" : "outline"}
            onClick={() => setPeriod("all")}
          >
            All Time
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Study Hours</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{studyHours}</span>
            <span className="text-sm text-green-600 mb-1">+{getTrendPercentage()}% from last {period}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Tasks Completed</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{tasksCompleted}</span>
            <span className="text-sm text-green-600 mb-1">+8% from last {period}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Current Streak</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{currentStreak} days</span>
            <span className="text-sm text-gray-500 mb-1">
              {currentStreak > 0 ? "Keep it up!" : "Start your streak today!"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Activity</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="study" name="Study Hours" fill="#6B9BF2" />
              <Bar dataKey="tasks" name="Tasks Completed" fill="#9B6BF2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Subject Distribution</h2>
          {subjectData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No subjects data available
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Top Achievements</h2>
          <div className="space-y-4">
            {currentStreak >= 7 && (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                  🔥
                </div>
                <div>
                  <h3 className="font-medium">7-Day Streak</h3>
                  <p className="text-sm text-gray-500">Studied every day for a week</p>
                </div>
              </div>
            )}
            
            {tasksCompleted >= 10 && (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center">
                  🌟
                </div>
                <div>
                  <h3 className="font-medium">Task Master</h3>
                  <p className="text-sm text-gray-500">Completed {tasksCompleted} tasks</p>
                </div>
              </div>
            )}
            
            {studyHours >= 10 && (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center">
                  📚
                </div>
                <div>
                  <h3 className="font-medium">Study Champion</h3>
                  <p className="text-sm text-gray-500">Studied for {studyHours}+ hours</p>
                </div>
              </div>
            )}
            
            {/* If user has no achievements yet */}
            {currentStreak < 7 && tasksCompleted < 10 && studyHours < 10 && (
              <div className="text-center py-4 text-gray-500">
                <p>Complete tasks and study regularly to earn achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
