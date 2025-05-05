
import { supabase } from "@/integrations/supabase/client";
import { StudySession, UserStats } from "@/types";

export async function startStudySession(subjectId?: string): Promise<StudySession> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to start a study session");

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: session.user.id,
      subject_id: subjectId || null,
      duration: 0, // Will be updated when session is completed
      completed: false,
      xp_earned: 0, // Will be updated when session is completed
      started_at: new Date().toISOString(),
      ended_at: null
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting study session:", error);
    throw error;
  }

  return {
    id: data.id,
    subjectId: data.subject_id,
    duration: data.duration,
    completed: data.completed,
    xpEarned: data.xp_earned,
    startedAt: data.started_at,
    endedAt: data.ended_at
  };
}

export async function completeStudySession(
  id: string,
  duration: number,
  xpEarned: number
): Promise<void> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to complete a study session");

  const { error: sessionError } = await supabase
    .from("study_sessions")
    .update({
      duration,
      xp_earned: xpEarned,
      completed: true,
      ended_at: new Date().toISOString()
    })
    .eq("id", id);

  if (sessionError) {
    console.error("Error completing study session:", sessionError);
    throw sessionError;
  }

  // Update user stats - add XP and update streak
  const { data: statsData, error: statsGetError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (statsGetError) {
    console.error("Error getting user stats:", statsGetError);
    throw statsGetError;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if we need to update the streak
  let newStreak = statsData.study_streak;
  const lastStudyDate = statsData.last_study_date;
  
  if (!lastStudyDate) {
    // First study session ever
    newStreak = 1;
  } else {
    const lastDate = new Date(lastStudyDate);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    
    if (lastStudyDate === yesterday) {
      // Studied yesterday, increment streak
      newStreak += 1;
    } else if (lastStudyDate !== today) {
      // Didn't study yesterday and not already recorded for today, reset streak
      newStreak = 1;
    }
  }

  const { error: statsUpdateError } = await supabase
    .from("user_stats")
    .update({
      current_xp: statsData.current_xp + xpEarned,
      total_xp: statsData.total_xp + xpEarned,
      study_streak: newStreak,
      last_study_date: today
    })
    .eq("user_id", session.user.id);

  if (statsUpdateError) {
    console.error("Error updating user stats:", statsUpdateError);
    throw statsUpdateError;
  }
  
  // Check if any achievements should be unlocked
  await checkSessionAchievements(session.user.id);
}

export async function getStudySessions(): Promise<StudySession[]> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get study sessions");

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error getting study sessions:", error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    subjectId: item.subject_id,
    duration: item.duration,
    completed: item.completed,
    xpEarned: item.xp_earned,
    startedAt: item.started_at,
    endedAt: item.ended_at
  }));
}

export async function getUserStats(): Promise<UserStats> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get user stats");

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle(); // Changed from .single() to .maybeSingle()

  if (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }

  // If no data found, create default user stats
  if (!data) {
    const defaultStats = {
      level: 1,
      currentXp: 0,
      totalXp: 0,
      studyStreak: 0,
      lastStudyDate: null
    };

    try {
      // Insert default stats
      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert({
          user_id: session.user.id,
          level: defaultStats.level,
          current_xp: defaultStats.currentXp,
          total_xp: defaultStats.totalXp,
          study_streak: defaultStats.studyStreak,
          last_study_date: defaultStats.lastStudyDate
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      return {
        level: newStats.level,
        currentXp: newStats.current_xp,
        totalXp: newStats.total_xp,
        studyStreak: newStats.study_streak,
        lastStudyDate: newStats.last_study_date
      };
    } catch (insertError) {
      console.error("Error creating default user stats:", insertError);
      // Return default stats even if insert fails
      return defaultStats;
    }
  }

  return {
    level: data.level,
    currentXp: data.current_xp,
    totalXp: data.total_xp,
    studyStreak: data.study_streak,
    lastStudyDate: data.last_study_date
  };
}

// Helper function to check and unlock achievements based on study sessions
async function checkSessionAchievements(userId: string): Promise<void> {
  // Get total completed sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true);

  if (sessionsError) {
    console.error("Error checking session achievements:", sessionsError);
    return;
  }

  const totalSessions = sessions?.length || 0;
  const totalHours = sessions?.reduce((sum, session) => sum + (session.duration / 60), 0) || 0;
  
  // Unlock 'First Steps' achievement if this is the first completed session
  if (totalSessions === 1) {
    await unlockAchievement(userId, 'First Steps');
  }
  
  // Unlock 'Dedicated Scholar' achievement if user has studied for 10+ hours
  if (totalHours >= 10) {
    await unlockAchievement(userId, 'Dedicated Scholar');
  }
}

export async function unlockAchievement(userId: string, achievementName: string): Promise<void> {
  // Find the achievement
  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("name", achievementName)
    .single();

  if (achievementError) {
    console.error("Error finding achievement:", achievementError);
    return;
  }

  // If already unlocked, do nothing
  if (achievement.unlocked) return;

  // Unlock the achievement
  const { error: updateError } = await supabase
    .from("achievements")
    .update({
      unlocked: true,
      unlocked_at: new Date().toISOString()
    })
    .eq("id", achievement.id);

  if (updateError) {
    console.error("Error unlocking achievement:", updateError);
  }
}
