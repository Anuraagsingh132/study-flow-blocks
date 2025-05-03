
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types";

export interface NoteData {
  title: string;
  content: string;
  tags: string[];
}

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }));
}

export async function getNoteById(id: string): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching note with ID ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    tags: data.tags,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function createNote(noteData: NoteData): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert([noteData])
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    tags: data.tags,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateNote(id: string, updates: Partial<NoteData>): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

export async function searchNotes(query: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error searching notes:", error);
    throw error;
  }

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }));
}
