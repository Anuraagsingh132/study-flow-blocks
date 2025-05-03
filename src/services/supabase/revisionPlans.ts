
import { supabase } from "@/integrations/supabase/client";
import { RevisionPlan, Priority } from "@/types";
import { addDays, format, parseISO } from "date-fns";
import { getSubjects } from "./subjects";

export async function getRevisionPlans(): Promise<RevisionPlan[]> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get revision plans");

  const { data, error } = await supabase
    .from("revision_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .order("review_date", { ascending: true });

  if (error) {
    console.error("Error getting revision plans:", error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    subjectId: item.subject_id,
    topic: item.topic,
    reviewDate: item.review_date,
    priority: item.priority as Priority,
    completed: item.completed
  }));
}

export async function createRevisionPlan(
  subjectId: string,
  topic: string,
  reviewDate: string,
  priority: Priority
): Promise<RevisionPlan> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to create a revision plan");

  const { data, error } = await supabase
    .from("revision_plans")
    .insert({
      user_id: session.user.id,
      subject_id: subjectId,
      topic,
      review_date: reviewDate,
      priority,
      completed: false
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating revision plan:", error);
    throw error;
  }

  return {
    id: data.id,
    subjectId: data.subject_id,
    topic: data.topic,
    reviewDate: data.review_date,
    priority: data.priority as Priority,
    completed: data.completed
  };
}

export async function completeRevisionPlan(id: string): Promise<void> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to complete a revision plan");

  const { error } = await supabase
    .from("revision_plans")
    .update({ completed: true })
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error completing revision plan:", error);
    throw error;
  }
}

export async function generateSpacedRevisions(
  subjectId: string,
  topic: string
): Promise<RevisionPlan[]> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to generate revision plans");

  // Generate spaced revision dates based on proven learning science
  // Day 1, Day 3, Day 7, Day 14, Day 30
  const spacedDates = [1, 3, 7, 14, 30].map(days => 
    format(addDays(new Date(), days), 'yyyy-MM-dd')
  );
  
  const priorities: Priority[] = ["high", "high", "medium", "medium", "low"];
  
  const createdPlans: RevisionPlan[] = [];
  
  // Create revision plan for each date
  for (let i = 0; i < spacedDates.length; i++) {
    const { data, error } = await supabase
      .from("revision_plans")
      .insert({
        user_id: session.user.id,
        subject_id: subjectId,
        topic,
        review_date: spacedDates[i],
        priority: priorities[i],
        completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating revision plan:", error);
      continue;
    }
    
    createdPlans.push({
      id: data.id,
      subjectId: data.subject_id,
      topic: data.topic,
      reviewDate: data.review_date,
      priority: data.priority as Priority,
      completed: data.completed
    });
  }
  
  return createdPlans;
}

// Function to suggest automatic revision plans based on recently studied topics
export async function suggestRevisionPlans(): Promise<RevisionPlan[]> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to suggest revision plans");
  
  // Get subjects
  const subjects = await getSubjects();
  
  // Get recent study blocks
  const { data: recentBlocks, error } = await supabase
    .from("study_blocks")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("completed", true)
    .order("created_at", { ascending: false })
    .limit(10);
  
  if (error) {
    console.error("Error getting recent study blocks:", error);
    return [];
  }
  
  // Check if any revision plans already exist for these topics
  const topics = recentBlocks.map(block => block.topic);
  
  const { data: existingPlans } = await supabase
    .from("revision_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .in("topic", topics);
  
  const existingTopics = new Set(existingPlans?.map(plan => plan.topic) || []);
  
  const suggestedPlans: RevisionPlan[] = [];
  
  // For topics without revision plans, suggest them
  for (const block of recentBlocks) {
    if (!existingTopics.has(block.topic)) {
      // Find the subject
      const subject = subjects.find(s => s.name === block.subject);
      
      if (subject) {
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from("revision_plans")
          .insert({
            user_id: session.user.id,
            subject_id: subject.id,
            topic: block.topic,
            review_date: tomorrow,
            priority: "medium",
            completed: false
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error creating suggested revision plan:", error);
          continue;
        }
        
        suggestedPlans.push({
          id: data.id,
          subjectId: data.subject_id,
          topic: data.topic,
          reviewDate: data.review_date,
          priority: data.priority as Priority,
          completed: data.completed
        });
        
        // Add to existing topics to avoid duplicates
        existingTopics.add(block.topic);
      }
    }
  }
  
  return suggestedPlans;
}
