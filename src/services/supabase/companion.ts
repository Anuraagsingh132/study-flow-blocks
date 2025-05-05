import { supabase } from "@/integrations/supabase/client";
import { StudyCompanion, CompanionType } from "@/types";

export async function getStudyCompanion(): Promise<StudyCompanion | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get study companion");

  const { data, error } = await supabase
    .from("study_companion")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error getting study companion:", error);
    return null;
  }

  // If no data found, create a default companion
  if (!data) {
    try {
      const defaultCompanion = {
        name: "Buddy",
        type: "owl" as CompanionType,
        level: 1,
        happiness: 80,
        energy: 100,
        lastInteraction: new Date().toISOString()
      };

      const { data: newCompanion, error: insertError } = await supabase
        .from("study_companion")
        .insert({
          user_id: session.user.id,
          name: defaultCompanion.name,
          type: defaultCompanion.type,
          level: defaultCompanion.level,
          happiness: defaultCompanion.happiness,
          energy: defaultCompanion.energy,
          last_interaction: defaultCompanion.lastInteraction
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        name: newCompanion.name,
        type: newCompanion.type,
        level: newCompanion.level,
        happiness: newCompanion.happiness,
        energy: newCompanion.energy,
        lastInteraction: newCompanion.last_interaction
      };
    } catch (insertError) {
      console.error("Error creating default study companion:", insertError);
      return null;
    }
  }

  return {
    name: data.name,
    type: data.type,
    level: data.level,
    happiness: data.happiness,
    energy: data.energy,
    lastInteraction: data.last_interaction
  };
}

export async function updateCompanion(
  updates: Partial<{
    name: string;
    type: CompanionType;
    happiness: number;
    energy: number;
  }>
): Promise<StudyCompanion | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to update study companion");

  // Only update the specified fields
  const updatedFields: any = { ...updates };
  
  // Always update last_interaction time when interacting with companion
  updatedFields.last_interaction = new Date().toISOString();

  const { data, error } = await supabase
    .from("study_companion")
    .update(updatedFields)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating study companion:", error);
    return null;
  }

  return {
    name: data.name,
    type: data.type,
    level: data.level,
    happiness: data.happiness,
    energy: data.energy,
    lastInteraction: data.last_interaction
  };
}

export async function levelUpCompanion(): Promise<StudyCompanion | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to level up study companion");

  // Get current companion data
  const { data: currentData, error: getError } = await supabase
    .from("study_companion")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (getError) {
    console.error("Error getting current companion data:", getError);
    return null;
  }

  // Increment level
  const { data, error } = await supabase
    .from("study_companion")
    .update({
      level: currentData.level + 1,
      happiness: Math.min(100, currentData.happiness + 20), // Boost happiness
      last_interaction: new Date().toISOString()
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error leveling up study companion:", error);
    return null;
  }

  return {
    name: data.name,
    type: data.type,
    level: data.level,
    happiness: data.happiness,
    energy: data.energy,
    lastInteraction: data.last_interaction
  };
}

export async function feedCompanion(): Promise<StudyCompanion | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to feed study companion");

  // Get current companion data
  const { data: currentData, error: getError } = await supabase
    .from("study_companion")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (getError) {
    console.error("Error getting current companion data:", getError);
    return null;
  }

  // Increase energy and happiness
  const { data, error } = await supabase
    .from("study_companion")
    .update({
      energy: Math.min(100, currentData.energy + 30),
      happiness: Math.min(100, currentData.happiness + 10),
      last_interaction: new Date().toISOString()
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error feeding study companion:", error);
    return null;
  }

  return {
    name: data.name,
    type: data.type,
    level: data.level,
    happiness: data.happiness,
    energy: data.energy,
    lastInteraction: data.last_interaction
  };
}

export async function playWithCompanion(): Promise<StudyCompanion | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to play with study companion");

  // Get current companion data
  const { data: currentData, error: getError } = await supabase
    .from("study_companion")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (getError) {
    console.error("Error getting current companion data:", getError);
    return null;
  }

  // Increase happiness but decrease energy
  const { data, error } = await supabase
    .from("study_companion")
    .update({
      energy: Math.max(0, currentData.energy - 10),
      happiness: Math.min(100, currentData.happiness + 20),
      last_interaction: new Date().toISOString()
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error playing with study companion:", error);
    return null;
  }

  return {
    name: data.name,
    type: data.type,
    level: data.level,
    happiness: data.happiness,
    energy: data.energy,
    lastInteraction: data.last_interaction
  };
}

export type CompanionMood = 'happy' | 'excited' | 'normal' | 'tired';

export function getCompanionMood(companion: StudyCompanion): CompanionMood {
  if (!companion) return "normal";
  
  // Calculate mood based on happiness and energy
  if (companion.happiness > 80 && companion.energy > 50) {
    return "excited";
  } else if (companion.happiness > 50) {
    return "happy";
  } else if (companion.energy < 30) {
    return "tired";
  } else {
    return "normal";
  }
}
