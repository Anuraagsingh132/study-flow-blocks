
import React, { useState, useEffect } from "react";
import { Plus, Calendar, Check, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Goal } from "@/types";
import { generateSampleGoals } from "@/utils/sample-data";
import { Checkbox } from "@/components/ui/checkbox";

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setGoals(generateSampleGoals());
  }, []);

  const handleToggleStep = (goalId: string, stepId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id === goalId) {
          const updatedSteps = goal.steps.map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          );
          
          const completedStepsCount = updatedSteps.filter((step) => step.completed).length;
          const progress = Math.round((completedStepsCount / updatedSteps.length) * 100);
          
          return {
            ...goal,
            steps: updatedSteps,
            progress,
            completed: progress === 100,
          };
        }
        return goal;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Goals Tracker</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-6">
            {goals
              .filter((goal) => !goal.completed)
              .map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-xl">{goal.title}</h3>
                    <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{goal.description}</p>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-500">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 mb-6" />

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium mb-2">Steps</h4>
                    <div className="space-y-2">
                      {goal.steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-2">
                          <Checkbox
                            checked={step.completed}
                            onCheckedChange={() => handleToggleStep(goal.id, step.id)}
                            className="mt-1"
                          />
                          <span
                            className={`text-sm ${
                              step.completed ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-6">
            {goals.filter((goal) => goal.completed).length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                <Check className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <p className="font-medium">No completed goals yet</p>
                <p className="text-sm mt-1">Complete your active goals to see them here</p>
              </div>
            ) : (
              goals
                .filter((goal) => goal.completed)
                .map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-xl">{goal.title}</h3>
                      <div className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-md flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </div>
                    </div>
                    <p className="text-gray-600">{goal.description}</p>
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-xl">{goal.title}</h3>
                  {goal.completed ? (
                    <div className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-md flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{goal.description}</p>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;
