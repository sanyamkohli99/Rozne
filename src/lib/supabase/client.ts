import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    `https://ijhzkrbxahlhpkcextwl.supabase.co`,
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaHprcmJ4YWhsaHBrY2V4dHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODE3NTYsImV4cCI6MjA5NTk1Nzc1Nn0.kR8iHK6eBjss02pwdqA_AO4D6qow_leCMsLlmvOSuAM`,
  );
}

const supabaseClient = createClient();
export default supabaseClient;
