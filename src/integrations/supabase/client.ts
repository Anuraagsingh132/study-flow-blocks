// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ayuatdzalyyiebvmvdit.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dWF0ZHphbHl5aWVidm12ZGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDI0NDksImV4cCI6MjA2MTc3ODQ0OX0.zsvDXhSajH9n_Ai1jlcSe5WcF3rKsWKGHt5HFApwOkk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);