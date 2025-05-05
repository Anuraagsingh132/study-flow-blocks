import { supabase } from ".";
import { StudyBlock } from "@/types";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";

export const getStudyBlocks = async (selectedDate: Date): Promise<StudyBlock[]> => {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('study_blocks')
    .select('*')
    .eq('user_id', supabase.auth.currentUser?.id)
    .gte('start_time', `${formattedDate}T00:00:00+00:00`)
    .lt('start_time', `${format(addDays(selectedDate, 1), 'yyyy-MM-dd')}T00:00:00+00:00`)
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Error fetching study blocks:", error);
    throw error;
  }

  return data as StudyBlock[];
};

export const createStudyBlock = async (block: Omit<StudyBlock, 'id' | 'created_at' | 'user_id' | 'completed'>): Promise<StudyBlock> => {
  const { data, error } = await supabase
    .from('study_blocks')
    .insert({ ...block, user_id: supabase.auth.currentUser?.id })
    .select('*')
    .single();

  if (error) {
    console.error("Error creating study block:", error);
    throw error;
  }

  return data as StudyBlock;
};

// Add this function to the studyBlocks service
export const updateStudyBlock = async (id: string, updates: Partial<StudyBlock>) => {
  const { data, error } = await supabase
    .from('study_blocks')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error updating study block:', error);
    throw error;
  }
  
  return data as StudyBlock;
};
