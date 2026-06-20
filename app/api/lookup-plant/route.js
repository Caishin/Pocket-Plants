import { createClient } from '@supabase/supabase-js';

// Server-side client (uses the same public anon key — species table is public-readable)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || '').trim();

  if (!name) {
    return Response.json({ matches: [] });
  }

  // Exact match first
  const { data: exact } = await supabase
    .from('species')
    .select('*')
    .ilike('common_name', name)
    .limit(1);

  if (exact && exact.length > 0) {
    return Response.json({ matches: exact });
  }

  // Fall back to partial/fuzzy match
  const { data: partial, error } = await supabase
    .from('species')
    .select('*')
    .ilike('common_name', `%${name}%`)
    .limit(5);

  if (error) {
    return Response.json({ matches: [], error: error.message }, { status: 500 });
  }

  return Response.json({ matches: partial || [] });
}
