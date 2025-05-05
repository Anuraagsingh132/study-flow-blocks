
import { supabase } from "@/integrations/supabase/client";
import { StudyBlock } from "@/types";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";

export const getStudyBlocks = async (selectedDate?: Date): Promise<StudyBlock[]> => {
  // If no date is provided, fetch all blocks (for Progress page)
  if (!selectedDate) {
    const { data, error } = await supabase
      .from('study_blocks')
      .select('*')
      .eq('user_id', supabase.auth.currentUser?.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error("Error fetching study blocks:", error);
      throw error;
    }

    return (data || []).map(transformStudyBlockFromDB);
  }

  // Fetch blocks for a specific date
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

  return (data || []).map(transformStudyBlockFromDB);
};

export const createStudyBlock = async (block: Omit<StudyBlock, 'id' | 'created_at' | 'user_id' | 'completed'>): Promise<StudyBlock> => {
  // Transform the block data to match database field names
  const dbBlock = {
    subject: block.subject,
    topic: block.topic,
    start_time: block.startTime,
    end_time: block.endTime,
    priority: block.priority,
  };

  const { data, error } = await supabase
    .from('study_blocks')
    .insert({ ...dbBlock, user_id: supabase.auth.currentUser?.id })
    .select('*')
    .single();

  if (error) {
    console.error("Error creating study block:", error);
    throw error;
  }

  return transformStudyBlockFromDB(data);
};

export const updateStudyBlock = async (id: string, updates: Partial<StudyBlock>) => {
  // Transform any updates to match database field names
  const dbUpdates: any = { ...updates };
  
  if (updates.startTime !== undefined) {
    dbUpdates.start_time = updates.startTime;
    delete dbUpdates.startTime;
  }
  
  if (updates.endTime !== undefined) {
    dbUpdates.end_time = updates.endTime;
    delete dbUpdates.endTime;
  }

  const { data, error } = await supabase
    .from('study_blocks')
    .update(dbUpdates)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error updating study block:', error);
    throw error;
  }
  
  return transformStudyBlockFromDB(data);
};

// Helper function to transform database fields to match our frontend type
function transformStudyBlockFromDB(dbBlock: any): StudyBlock {
  return {
    id: dbBlock.id,
    subject: dbBlock.subject,
    topic: dbBlock.topic,
    startTime: dbBlock.start_time,
    endTime: dbBlock.end_time,
    priority: dbBlock.priority,
    completed: dbBlock.completed
  };
}
