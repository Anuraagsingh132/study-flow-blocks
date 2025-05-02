
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const ProgressPage: React.FC = () => {
  // Sample data for charts
  const weeklyData = [
    { name: "Mon", study: 3, tasks: 5 },
    { name: "Tue", study: 4, tasks: 6 },
    { name: "Wed", study: 2, tasks: 3 },
    { name: "Thu", study: 5, tasks: 7 },
    { name: "Fri", study: 3, tasks: 4 },
    { name: "Sat", study: 6, tasks: 8 },
    { name: "Sun", study: 2, tasks: 3 },
  ];

  const subjectData = [
    { name: "Mathematics", value: 30 },
    { name: "Physics", value: 25 },
    { name: "Computer Science", value: 20 },
    { name: "Biology", value: 15 },
    { name: "Chemistry", value: 10 },
  ];

  const COLORS = ["#6B9BF2", "#F26B9B", "#9B6BF2", "#6BF29B", "#F2D16B"];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Progress</h1>
          <p className="text-gray-500">Track your study habits and achievements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            This Week
          </Button>
          <Button variant="outline">This Month</Button>
          <Button variant="outline">All Time</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Study Hours</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">24.5</span>
            <span className="text-sm text-green-600 mb-1">+12% from last week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Tasks Completed</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">36</span>
            <span className="text-sm text-green-600 mb-1">+8% from last week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Current Streak</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">6 days</span>
            <span className="text-sm text-gray-500 mb-1">Keep it up!</span>
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
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Top Achievements</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-studyflow-blue text-studyflow-blue-dark rounded-full flex items-center justify-center">
                🔥
              </div>
              <div>
                <h3 className="font-medium">7-Day Streak</h3>
                <p className="text-sm text-gray-500">Studied every day for a week</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-studyflow-purple text-studyflow-purple-dark rounded-full flex items-center justify-center">
                🌟
              </div>
              <div>
                <h3 className="font-medium">Goal Master</h3>
                <p className="text-sm text-gray-500">Completed 10 goals</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-studyflow-green text-studyflow-green-dark rounded-full flex items-center justify-center">
                📚
              </div>
              <div>
                <h3 className="font-medium">Study Champion</h3>
                <p className="text-sm text-gray-500">Studied for 50+ hours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-studyflow-yellow text-studyflow-yellow-dark rounded-full flex items-center justify-center">
                ✅
              </div>
              <div>
                <h3 className="font-medium">Task Wizard</h3>
                <p className="text-sm text-gray-500">Completed 100 tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
