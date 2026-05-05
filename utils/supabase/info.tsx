// Supabase project info — values come from environment variables (Vite).
// Set these in `.env` for local dev (see `.env.example`).
// In production (Vercel), define them in the project's Environment Variables.

const projectIdFromEnv = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const anonKeyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!projectIdFromEnv || !anonKeyFromEnv) {
  throw new Error(
    "Supabase env vars missing. Define VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const projectId = projectIdFromEnv;
export const publicAnonKey = anonKeyFromEnv;
