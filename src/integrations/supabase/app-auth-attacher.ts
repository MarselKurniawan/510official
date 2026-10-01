import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./app-client";

// Attaches the user's session token (from the project's own Supabase) to serverFn calls.
export const attachAppSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
