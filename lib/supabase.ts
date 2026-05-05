// Lightweight Supabase REST helper — no SDK dependency.
// Uses service_role on the server so RLS doesn't get in the way for the demo.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && (SERVICE || ANON));
}

export async function sbSelect<T>(table: string, query = ""): Promise<T[]> {
  if (!URL) throw new Error("Supabase not configured");
  const key = SERVICE || ANON!;
  const r = await fetch(`${URL}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Supabase ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}

export async function sbUpsert<T>(table: string, rows: T[], onConflict?: string) {
  if (!URL || !SERVICE) throw new Error("Supabase service key required");
  const qs = onConflict ? `?on_conflict=${onConflict}` : "";
  const r = await fetch(`${URL}/rest/v1/${table}${qs}`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`Supabase upsert ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}
