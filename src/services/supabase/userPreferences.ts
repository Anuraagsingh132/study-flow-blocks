
import { supabase } from "@/integrations/supabase/client";

export interface UserPreferences {
  theme: string;
  timezone: string;
  font_size: string;
  animations_enabled: boolean;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No preferences found, return defaults
      return {
        theme: "light",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        font_size: "medium",
        animations_enabled: true
      };
    }
    console.error("Error fetching user preferences:", error);
    throw error;
  }

  return {
    theme: data.theme,
    timezone: data.timezone,
    font_size: data.font_size,
    animations_enabled: data.animations_enabled
  };
}

export async function updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .update(updates)
    .select()
    .single();

  if (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }

  return {
    theme: data.theme,
    timezone: data.timezone,
    font_size: data.font_size,
    animations_enabled: data.animations_enabled
  };
}
