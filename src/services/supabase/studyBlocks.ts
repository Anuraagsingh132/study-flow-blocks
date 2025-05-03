
import { supabase } from "@/integrations/supabase/client";
import { StudyBlock, Priority } from "@/types";

export interface StudyBlockData {
  subject: string;
  topic: string;
  start_time: string;
  end_time: string;
  priority: Priority;
  completed?: boolean;
}

export async function getStudyBlocks(date?: Date): Promise<StudyBlock[]> {
  let query = supabase
    .from("study_blocks")
    .select("*")
    .order("start_time", { ascending: true });

  if (date) {
    // If a specific date is provided, filter blocks for that day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching study blocks:", error);
    throw error;
  }

  return data.map(block => ({
    id: block.id,
    subject: block.subject,
    topic: block.topic,
    startTime: block.start_time,
    endTime: block.end_time,
    priority: block.priority as Priority,
    completed: block.completed
  }));
}

export async function createStudyBlock(blockData: StudyBlockData): Promise<StudyBlock> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to create a study block");

  const { data, error } = await supabase
    .from("study_blocks")
    .insert([{
      ...blockData,
      user_id: session.user.id
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating study block:", error);
    throw error;
  }

  return {
    id: data.id,
    subject: data.subject,
    topic: data.topic,
    startTime: data.start_time,
    endTime: data.end_time,
    priority: data.priority as Priority,
    completed: data.completed
  };
}

export async function updateStudyBlock(id: string, updates: Partial<StudyBlockData>): Promise<void> {
  const { error } = await supabase
    .from("study_blocks")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating study block:", error);
    throw error;
  }
}

export async function toggleStudyBlockCompletion(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("study_blocks")
    .update({ completed })
    .eq("id", id);

  if (error) {
    console.error("Error toggling study block completion:", error);
    throw error;
  }
}

export async function deleteStudyBlock(id: string): Promise<void> {
  const { error } = await supabase
    .from("study_blocks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting study block:", error);
    throw error;
  }
}
