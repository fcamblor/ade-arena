import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, FeatureStatsRow, RatingRow } from './supabase';
import type { OrchestratorVersion, SupportLevel } from '../data/schema';

export type RatingMap = Record<string, number>;

export type WeightedScore = {
  toolId: string;
  toolName: string;
  version: string;
  score: number;
  possible: number;
  percent: number;
  ratedFeatureCount: number;
};

export const RATING_POINTS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 6,
  5: 10,
};

export function ratingToPoints(rating: number): number {
  const rounded = Math.round(rating);
  if (rounded <= 1) return 0;
  if (rounded >= 5) return 10;
  return RATING_POINTS[rounded] ?? 0;
}

export async function fetchMyRatings(supabase: SupabaseClient<Database>): Promise<RatingMap> {
  const { data, error } = await supabase.from('ratings').select('feature_id, rating');
  if (error) throw error;
  return Object.fromEntries(((data ?? []) as Pick<RatingRow, 'feature_id' | 'rating'>[]).map((row) => [row.feature_id, row.rating]));
}

export async function upsertRating(
  supabase: SupabaseClient<Database>,
  userId: string,
  featureId: string,
  rating: number,
): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .upsert({ user_id: userId, feature_id: featureId, rating }, { onConflict: 'user_id,feature_id' });
  if (error) throw error;
}

export async function deleteRating(supabase: SupabaseClient<Database>, featureId: string): Promise<void> {
  const { error } = await supabase.from('ratings').delete().eq('feature_id', featureId);
  if (error) throw error;
}

export async function fetchFeatureStats(supabase: SupabaseClient<Database>): Promise<Record<string, FeatureStatsRow>> {
  const { data, error } = await supabase.from('feature_stats').select('*');
  if (error) throw error;
  return Object.fromEntries(((data ?? []) as FeatureStatsRow[]).map((row) => [row.feature_id, row]));
}

export async function fetchUniqueVoterCount(supabase: SupabaseClient<Database>): Promise<number> {
  const { data, error } = await supabase.from('community_voters').select('voter_count').single();
  if (error) {
    // Surface the underlying failure (RLS 42501, expired JWT, schema mismatch)
    // so it can be diagnosed instead of silently rendered as "0 voters".
    console.warn('fetchUniqueVoterCount failed', error);
    return 0;
  }
  return Number((data as { voter_count: number } | null)?.voter_count ?? 0);
}

export function supportWeight(level: SupportLevel | undefined): number {
  if (level === 'yes') return 1;
  if (level === 'partial') return 0.5;
  return 0;
}

export function computeWeightedScores(
  orchestrators: Pick<OrchestratorVersion, 'toolId' | 'toolName' | 'version' | 'features'>[],
  ratings: RatingMap,
): WeightedScore[] {
  const ratedEntries = Object.entries(ratings).filter(([, rating]) => rating > 0);
  const possible = ratedEntries.reduce((sum, [, rating]) => sum + ratingToPoints(rating), 0);

  return orchestrators
    .map((tool) => {
      const score = ratedEntries.reduce((sum, [featureId, rating]) => {
        const support = tool.features.find((feature) => feature.featureId === featureId)?.support;
        return sum + ratingToPoints(rating) * supportWeight(support);
      }, 0);
      return {
        toolId: tool.toolId,
        toolName: tool.toolName,
        version: tool.version,
        score,
        possible,
        percent: possible > 0 ? Math.round((score / possible) * 1000) / 10 : 0,
        ratedFeatureCount: ratedEntries.length,
      };
    })
    .sort((a, b) => b.percent - a.percent || b.score - a.score || a.toolName.localeCompare(b.toolName));
}

export function ratingRowsToMap(rows: Pick<RatingRow, 'feature_id' | 'rating'>[]): RatingMap {
  return Object.fromEntries(rows.map((row) => [row.feature_id, row.rating]));
}
