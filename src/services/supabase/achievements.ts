import { supabase } from "@/integrations/supabase/client";
import { Achievement, DailyChallenge } from "@/types";

export async function getAchievements(): Promise<Achievement[]> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get achievements");

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", session.user.id)
    .order("unlocked", { ascending: false });

  if (error) {
    console.error("Error getting achievements:", error);
    throw error;
  }

  // If no achievements found, return empty array (we don't need to create default ones here)
  if (!data || data.length === 0) {
    // Create default achievements
    try {
      const defaultAchievements = [
        {
          name: 'First Steps',
          description: 'Complete your first study session',
          badgeImage: 'badge-first-steps.svg',
          unlocked: false
        },
        {
          name: 'Knowledge Explorer',
          description: 'Study 5 different subjects',
          badgeImage: 'badge-explorer.svg',
          unlocked: false
        },
        {
          name: 'Dedicated Scholar',
          description: 'Complete 10 hours of studying',
          badgeImage: 'badge-scholar.svg',
          unlocked: false
        }
      ];

      const achievementsToInsert = defaultAchievements.map(achievement => ({
        user_id: session.user.id,
        name: achievement.name,
        description: achievement.description,
        badge_image: achievement.badgeImage,
        unlocked: achievement.unlocked
      }));

      const { data: insertedAchievements, error: insertError } = await supabase
        .from("achievements")
        .insert(achievementsToInsert)
        .select();

      if (insertError) throw insertError;

      return insertedAchievements.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        badgeImage: item.badge_image,
        unlocked: item.unlocked,
        unlockedAt: item.unlocked_at
      }));
    } catch (insertError) {
      console.error("Error creating default achievements:", insertError);
      return [];
    }
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    badgeImage: item.badge_image,
    unlocked: item.unlocked,
    unlockedAt: item.unlocked_at
  }));
}

export async function getDailyChallenge(): Promise<DailyChallenge | null> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to get daily challenge");

  // Get active daily challenge
  const { data, error } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("user_id", session.user.id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // Changed from .single() to .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error("Error getting daily challenge:", error);
    return null;
  }

  // If no challenge is found, generate a new one
  if (!data) {
    try {
      // Fix: Manually create a daily challenge instead of using the function
      const challengeOptions = [
        { title: 'Complete 2 Pomodoro sessions', description: 'Complete 2 focused study sessions today', xp: 20 },
        { title: 'Add notes for a subject', description: 'Create comprehensive notes for any subject', xp: 15 },
        { title: 'Review yesterday\'s material', description: 'Spend 15 minutes reviewing what you learned yesterday', xp: 10 },
        { title: 'Plan tomorrow\'s studies', description: 'Create a study plan for tomorrow', xp: 10 },
        { title: 'Study a difficult topic', description: 'Tackle that challenging topic you\'ve been avoiding', xp: 25 }
      ];
      
      // Select a random challenge
      const selectedChallenge = challengeOptions[Math.floor(Math.random() * challengeOptions.length)];
      
      // Calculate expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Create new challenge
      const { data: newChallenge, error: insertError } = await supabase
        .from("daily_challenges")
        .insert({
          user_id: session.user.id,
          title: selectedChallenge.title,
          description: selectedChallenge.description,
          xp: selectedChallenge.xp,
          completed: false,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating daily challenge:", insertError);
        return null;
      }

      return {
        id: newChallenge.id,
        title: newChallenge.title,
        description: newChallenge.description,
        xp: newChallenge.xp,
        completed: newChallenge.completed,
        createdAt: newChallenge.created_at,
        completedAt: newChallenge.completed_at,
        expiresAt: newChallenge.expires_at
      };
    } catch (createError) {
      console.error("Error generating new challenge:", createError);
      return null;
    }
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    xp: data.xp,
    completed: data.completed,
    createdAt: data.created_at,
    completedAt: data.completed_at,
    expiresAt: data.expires_at
  };
}

export async function completeDailyChallenge(id: string): Promise<void> {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User must be logged in to complete daily challenge");

  // Update the challenge as completed
  const { error } = await supabase
    .from("daily_challenges")
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error completing daily challenge:", error);
    throw error;
  }

  // Get the challenge to award XP
  const { data: challenge, error: challengeError } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (challengeError) {
    console.error("Error getting challenge for XP award:", challengeError);
    return;
  }

  // Add XP to user stats
  const { data: statsData, error: statsGetError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (statsGetError) {
    console.error("Error getting user stats:", statsGetError);
    return;
  }

  const { error: statsUpdateError } = await supabase
    .from("user_stats")
    .update({
      current_xp: statsData.current_xp + challenge.xp,
      total_xp: statsData.total_xp + challenge.xp
    })
    .eq("user_id", session.user.id);

  if (statsUpdateError) {
    console.error("Error updating user stats with challenge XP:", statsUpdateError);
  }
}

// Helper function to generate a new daily challenge
async function generateNewDailyChallenge(userId: string): Promise<void> {
  // Implementation is now in getDailyChallenge function
  // This function now exists only for backward compatibility
  console.log("Generating new daily challenge for user:", userId);
}
