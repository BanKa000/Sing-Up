import { createClient } from '@supabase/supabase-js';

export default {
  async fetch(request, env) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('items').select('*');
    return new Response(JSON.stringify(error || data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
