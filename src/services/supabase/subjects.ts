
import { supabase } from "@/integrations/supabase/client";
import { Subject } from "@/types";
import { useAuth } from "@/context/AuthContext";

export interface SubjectData {
  name: string;
  color: string;
  total_chapters: number;
  completed_chapters: number;
}

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }

  return data.map(subject => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    progress: subject.total_chapters > 0 
      ? Math.round((subject.completed_chapters / subject.total_chapters) * 100) 
      : 0,
    totalChapters: subject.total_chapters,
    completedChapters: subject.completed_chapters
  }));
}

export async function createSubject(subjectData: SubjectData): Promise<Subject> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to create a subject");

  const { data, error } = await supabase
    .from("subjects")
    .insert([{
      ...subjectData,
      user_id: session.user.id
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating subject:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    progress: data.total_chapters > 0 
      ? Math.round((data.completed_chapters / data.total_chapters) * 100) 
      : 0,
    totalChapters: data.total_chapters,
    completedChapters: data.completed_chapters
  };
}

export async function updateSubject(id: string, updates: Partial<SubjectData>): Promise<void> {
  const { error } = await supabase
    .from("subjects")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
}

export async function updateChapterCompletion(
  id: string, 
  completedChapters: number,
  totalChapters: number
): Promise<void> {
  const { error } = await supabase
    .from("subjects")
    .update({
      completed_chapters: completedChapters,
      total_chapters: totalChapters
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating chapter completion:", error);
    throw error;
  }
}
