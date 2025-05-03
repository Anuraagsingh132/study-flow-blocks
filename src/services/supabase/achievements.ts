
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
    .single();

  if (error) {
    // If no challenge is found, generate a new one
    if (error.code === "PGRST116") {
      await generateNewDailyChallenge(session.user.id);
      return getDailyChallenge();
    }
    
    console.error("Error getting daily challenge:", error);
    return null;
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
  try {
    // Call the database function to create a new challenge
    await supabase.rpc('create_daily_challenge_for_user', {
      user_id_param: userId
    });
  } catch (error) {
    console.error("Error generating new challenge:", error);
  }
}
