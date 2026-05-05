import { projectId, publicAnonKey } from '/utils/supabase/info';

export const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7fd6a14`;

export const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${publicAnonKey}`,
};

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...HEADERS, ...options?.headers } });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
