
import React, { useState, useEffect } from "react";
import { Plus, Calendar, Check, Flag, Trash2, Edit, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Goal } from "@/types";
import { getGoals, createGoal, deleteGoal, toggleGoalStep, addGoalStep, deleteGoalStep } from "@/services/supabase/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [steps, setSteps] = useState<{ title: string }[]>([]);
  const [stepTitle, setStepTitle] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
    } catch (error) {
      toast.error("Failed to load goals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    try {
      // Ensure deadline is set
      if (!deadline) {
        toast.error("Please set a deadline");
        return;
      }
      
      const newGoal = await createGoal({
        title,
        description,
        deadline,
        steps
      });
      
      setGoals([...goals, newGoal]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Goal added successfully");
    } catch (error) {
      toast.error("Failed to add goal");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id);
        setGoals(goals.filter(goal => goal.id !== id));
        toast.success("Goal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete goal");
        console.error(error);
      }
    }
  };

  const handleToggleStep = async (goalId: string, stepId: string, completed: boolean) => {
    try {
      await toggleGoalStep(goalId, stepId, completed);
      
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          // Update the specific step
          const updatedSteps = goal.steps.map(step =>
            step.id === stepId ? { ...step, completed } : step
          );
          
          // Calculate new progress
          const completedStepsCount = updatedSteps.filter(step => step.completed).length;
          const progress = Math.round((completedStepsCount / updatedSteps.length) * 100);
          
          return {
            ...goal,
            steps: updatedSteps,
            progress,
            completed: progress === 100
          };
        }
        return goal;
      }));
    } catch (error) {
      toast.error("Failed to update step");
      console.error(error);
    }
  };

  const addStepToForm = () => {
    if (stepTitle.trim()) {
      setSteps([...steps, { title: stepTitle.trim() }]);
      setStepTitle("");
    }
  };

  const removeStepFromForm = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleAddStepToGoal = async () => {
    if (!currentGoal || !stepTitle.trim()) return;
    
    try {
      const newStep = await addGoalStep(currentGoal.id, stepTitle.trim());
      
      // Update the goals state
      setGoals(goals.map(goal => {
        if (goal.id === currentGoal.id) {
          const updatedSteps = [...goal.steps, newStep];
          
          // Recalculate progress (will be 0 since the new step is not completed)
          const completedStepsCount = updatedSteps.filter(step => step.completed).length;
          const progress = Math.round((completedStepsCount / updatedSteps.length) * 100);
          
          return {
            ...goal,
            steps: updatedSteps,
            progress,
            completed: progress === 100
          };
        }
        return goal;
      }));
      
      setStepTitle("");
      setIsAddStepDialogOpen(false);
      toast.success("Step added successfully");
    } catch (error) {
      toast.error("Failed to add step");
      console.error(error);
    }
  };

  const handleDeleteStep = async (goalId: string, stepId: string) => {
    if (confirm("Are you sure you want to delete this step?")) {
      try {
        await deleteGoalStep(goalId, stepId);
        
        // Update the goals state
        setGoals(goals.map(goal => {
          if (goal.id === goalId) {
            const updatedSteps = goal.steps.filter(step => step.id !== stepId);
            
            // Recalculate progress
            const completedStepsCount = updatedSteps.filter(step => step.completed).length;
            const progress = updatedSteps.length > 0 
              ? Math.round((completedStepsCount / updatedSteps.length) * 100) 
              : 0;
              
            return {
              ...goal,
              steps: updatedSteps,
              progress,
              completed: progress === 100
            };
          }
          return goal;
        }));
        
        toast.success("Step deleted successfully");
      } catch (error) {
        toast.error("Failed to delete step");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setSteps([]);
    setStepTitle("");
    setCurrentGoal(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Goals Tracker</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {goals.filter((goal) => !goal.completed).length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <Flag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="font-medium mb-4">No active goals</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            ) : (
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
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md flex items-center whitespace-nowrap">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{goal.description}</p>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-500">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2 mb-6" />

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Steps</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              setCurrentGoal(goal);
                              setStepTitle("");
                              setIsAddStepDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Step
                          </Button>
                        </div>
                        
                        {goal.steps.length === 0 ? (
                          <p className="text-sm text-gray-500 mt-2">No steps added yet</p>
                        ) : (
                          <div className="space-y-2">
                            {goal.steps.map((step) => (
                              <div key={step.id} className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    checked={step.completed}
                                    onCheckedChange={(checked) => 
                                      handleToggleStep(goal.id, step.id, checked === true)
                                    }
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
                                <button
                                  onClick={() => handleDeleteStep(goal.id, step.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
                        <div className="flex items-center gap-2">
                          <div className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-md flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600">{goal.description}</p>
                      
                      <div className="border-t border-gray-100 mt-4 pt-4">
                        <h4 className="font-medium mb-2">Steps</h4>
                        <div className="space-y-2">
                          {goal.steps.map((step) => (
                            <div key={step.id} className="flex items-start gap-2">
                              <Checkbox checked={step.completed} disabled className="mt-1" />
                              <span className="text-sm line-through text-gray-400">
                                {step.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            {goals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <Flag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="font-medium mb-4">No goals created yet</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            ) : (
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
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete calculus course"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid w-full gap-2">
              <Label>Steps</Label>
              {steps.length > 0 && (
                <div className="space-y-2 mb-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{step.title}</span>
                      <button
                        onClick={() => removeStepFromForm(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="Add a step to achieve this goal"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && stepTitle.trim()) {
                      e.preventDefault();
                      addStepToForm();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={addStepToForm}
                  disabled={!stepTitle.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              disabled={!title || !description || !deadline}
            >
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Step to Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="step-title">Step Title</Label>
              <Input
                id="step-title"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                placeholder="e.g., Read chapter 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStepTitle("");
                setIsAddStepDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStepToGoal}
              disabled={!stepTitle.trim()}
            >
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
