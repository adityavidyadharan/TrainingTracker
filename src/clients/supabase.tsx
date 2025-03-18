import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/db";

const supabaseUrl = "https://yohqaopjnpypbrsmxvqu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaHFhb3BqbnB5cGJyc214dnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjU2MjgsImV4cCI6MjA1NzAwMTYyOH0.hHmt-c_9_lNTe8GC2zvT7m68EGy8ESvR-PddrHAyMrM";
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
