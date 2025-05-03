
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/types";

export interface GoalData {
  title: string;
  description: string;
  deadline: string;
  steps: { title: string }[];
}

export async function getGoals(): Promise<Goal[]> {
  const { data: goalsData, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .order("deadline", { ascending: true });

  if (goalsError) {
    console.error("Error fetching goals:", goalsError);
    throw goalsError;
  }

  // Now fetch all steps for these goals
  const goalIds = goalsData.map(goal => goal.id);
  
  const { data: stepsData, error: stepsError } = await supabase
    .from("goal_steps")
    .select("*")
    .in("goal_id", goalIds);

  if (stepsError) {
    console.error("Error fetching goal steps:", stepsError);
    throw stepsError;
  }

  // Convert to the format expected by the UI
  return goalsData.map(goal => {
    const goalSteps = stepsData
      .filter(step => step.goal_id === goal.id)
      .map(step => ({
        id: step.id,
        title: step.title,
        completed: step.completed
      }));
      
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      completed: goal.completed,
      progress: goal.progress,
      steps: goalSteps
    };
  });
}

export async function createGoal(goalData: GoalData): Promise<Goal> {
  // Insert the goal first
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .insert([{
      title: goalData.title,
      description: goalData.description,
      deadline: goalData.deadline,
      progress: 0,
      completed: false
    }])
    .select()
    .single();

  if (goalError) {
    console.error("Error creating goal:", goalError);
    throw goalError;
  }

  // Then insert the steps
  const stepsToInsert = goalData.steps.map(step => ({
    goal_id: goal.id,
    title: step.title,
    completed: false
  }));

  const { data: steps, error: stepsError } = await supabase
    .from("goal_steps")
    .insert(stepsToInsert)
    .select();

  if (stepsError) {
    console.error("Error creating goal steps:", stepsError);
    throw stepsError;
  }

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    deadline: goal.deadline,
    completed: goal.completed,
    progress: goal.progress,
    steps: steps.map(step => ({
      id: step.id,
      title: step.title,
      completed: step.completed
    }))
  };
}

export async function updateGoal(id: string, updates: Partial<Omit<GoalData, 'steps'>>): Promise<void> {
  const { error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
}

export async function deleteGoal(id: string): Promise<void> {
  // Steps will be automatically deleted due to CASCADE constraint
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
}

export async function toggleGoalStep(goalId: string, stepId: string, completed: boolean): Promise<void> {
  // Update the step
  const { error: stepError } = await supabase
    .from("goal_steps")
    .update({ completed })
    .eq("id", stepId);

  if (stepError) {
    console.error("Error updating goal step:", stepError);
    throw stepError;
  }

  // Get all steps for this goal to calculate progress
  const { data: steps, error: fetchError } = await supabase
    .from("goal_steps")
    .select("*")
    .eq("goal_id", goalId);

  if (fetchError) {
    console.error("Error fetching goal steps:", fetchError);
    throw fetchError;
  }

  // Calculate new progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isCompleted = progress === 100;

  // Update the goal's progress
  const { error: goalError } = await supabase
    .from("goals")
    .update({ 
      progress, 
      completed: isCompleted 
    })
    .eq("id", goalId);

  if (goalError) {
    console.error("Error updating goal progress:", goalError);
    throw goalError;
  }
}

export async function addGoalStep(goalId: string, stepTitle: string): Promise<{ id: string; title: string; completed: boolean }> {
  const { data, error } = await supabase
    .from("goal_steps")
    .insert([{
      goal_id: goalId,
      title: stepTitle,
      completed: false
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding goal step:", error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    completed: data.completed
  };
}

export async function deleteGoalStep(goalId: string, stepId: string): Promise<void> {
  // Delete the step
  const { error: deleteError } = await supabase
    .from("goal_steps")
    .delete()
    .eq("id", stepId);

  if (deleteError) {
    console.error("Error deleting goal step:", deleteError);
    throw deleteError;
  }

  // Update goal progress
  const { data: steps, error: fetchError } = await supabase
    .from("goal_steps")
    .select("*")
    .eq("goal_id", goalId);

  if (fetchError) {
    console.error("Error fetching goal steps:", fetchError);
    throw fetchError;
  }

  // Calculate new progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isCompleted = progress === 100;

  // Update the goal's progress
  const { error: goalError } = await supabase
    .from("goals")
    .update({ 
      progress, 
      completed: isCompleted 
    })
    .eq("id", goalId);

  if (goalError) {
    console.error("Error updating goal progress:", goalError);
    throw goalError;
  }
}
