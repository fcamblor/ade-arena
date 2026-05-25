import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, FeatureSkipRow } from './supabase';

export type SkipMap = Record<string, true>;

export async function fetchMySkips(supabase: SupabaseClient<Database>): Promise<SkipMap> {
  const { data, error } = await supabase.from('feature_skips').select('feature_id');
  if (error) throw error;
  const rows = (data ?? []) as Pick<FeatureSkipRow, 'feature_id'>[];
  return Object.fromEntries(rows.map((row) => [row.feature_id, true as const]));
}

export async function upsertSkip(
  supabase: SupabaseClient<Database>,
  userId: string,
  featureId: string,
): Promise<void> {
  const { error } = await supabase
    .from('feature_skips')
    .upsert({ user_id: userId, feature_id: featureId }, { onConflict: 'user_id,feature_id' });
  if (error) throw error;
}

export async function deleteSkip(supabase: SupabaseClient<Database>, featureId: string): Promise<void> {
  const { error } = await supabase.from('feature_skips').delete().eq('feature_id', featureId);
  if (error) throw error;
}
