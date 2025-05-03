
import { supabase } from "@/integrations/supabase/client";
import { Subject, Goal, StudyBlock, RevisionPlan } from "@/types";
import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";
import { getSubjects } from "./subjects";
import { getStudyBlocks } from "./studyBlocks";

export interface Suggestion {
  id: string;
  title: string;
  reason: string;
  urgency: "low" | "medium" | "high";
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
}

export async function getStudySuggestions(): Promise<Suggestion[]> {
  try {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User must be logged in");
    
    const suggestions: Suggestion[] = [];
    
    // Get user's subjects and study blocks
    const subjects = await getSubjects();
    const todayBlocks = await getStudyBlocks(new Date());
    
    // Get incomplete goals with approaching deadlines
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("completed", false)
      .order("deadline", { ascending: true })
      .limit(3);
    
    // Get upcoming revision tasks
    const { data: revisions } = await supabase
      .from("revision_plans")
      .select("*, subjects(*)")
      .eq("user_id", session.user.id)
      .eq("completed", false)
      .lte("review_date", format(addDays(new Date(), 3), 'yyyy-MM-dd'))
      .order("review_date", { ascending: true });
    
    // Find subjects with low progress
    const lowProgressSubjects = subjects
      .filter(subject => subject.progress < 30)
      .sort((a, b) => a.progress - b.progress);
    
    if (lowProgressSubjects.length > 0) {
      suggestions.push({
        id: `low-progress-${lowProgressSubjects[0].id}`,
        title: `Study ${lowProgressSubjects[0].name}`,
        reason: `Only ${lowProgressSubjects[0].progress}% complete`,
        urgency: "medium",
        subjectId: lowProgressSubjects[0].id,
        subjectName: lowProgressSubjects[0].name,
        subjectColor: lowProgressSubjects[0].color
      });
    }
    
    // Add suggestions for upcoming revisions
    if (revisions && revisions.length > 0) {
      revisions.forEach(revision => {
        const daysUntilReview = Math.ceil(
          (new Date(revision.review_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const urgency = daysUntilReview <= 1 ? "high" : "medium";
        
        suggestions.push({
          id: `revision-${revision.id}`,
          title: `Revise ${revision.topic}`,
          reason: daysUntilReview === 0 
            ? "Scheduled for today" 
            : daysUntilReview === 1 
              ? "Scheduled for tomorrow"
              : `Scheduled in ${daysUntilReview} days`,
          urgency,
          subjectId: revision.subject_id,
          subjectName: revision.subjects?.name,
          subjectColor: revision.subjects?.color
        });
      });
    }
    
    // Add suggestions for approaching deadlines
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        const daysUntilDeadline = Math.ceil(
          (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilDeadline <= 7) {
          const urgency = daysUntilDeadline <= 2 ? "high" : "medium";
          
          suggestions.push({
            id: `goal-${goal.id}`,
            title: goal.title,
            reason: daysUntilDeadline <= 0 
              ? "Deadline is today!" 
              : daysUntilDeadline === 1 
                ? "Deadline tomorrow"
                : `Due in ${daysUntilDeadline} days`,
            urgency
          });
        }
      });
    }
    
    // Get session data and check if user has studied today
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    
    const lastStudyDate = stats?.last_study_date ? new Date(stats.last_study_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!lastStudyDate || lastStudyDate < today) {
      suggestions.push({
        id: "daily-study",
        title: "Start today's study session",
        reason: "Maintain your study streak",
        urgency: "high"
      });
    }
    
    // Analyze study patterns and make a suggestion based on the time of day
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 21 && todayBlocks.length === 0) {
      suggestions.push({
        id: "evening-study",
        title: "Plan an evening study session",
        reason: "Evening is a good time to study",
        urgency: "low"
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error getting study suggestions:", error);
    return [];
  }
}
