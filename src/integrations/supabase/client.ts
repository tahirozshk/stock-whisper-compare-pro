// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cqrnguwkztokkmjoutyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcm5ndXdrenRva2ttam91dHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzAyNTAsImV4cCI6MjA2NTkwNjI1MH0.XilN_qEt6EfqW0nlPGdb_JvrJBPWk74bipLpyyiABNk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);