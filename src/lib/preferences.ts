import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserPreferencesRow } from './supabase';
import type { Platform } from '../data/schema';

// The OS choices offered in the rating tunnel. They map to the richer
// `Platform` set used by the dataset (note `mac` -> `macos`). `web` is never a
// daily-OS choice: it is a property of the tool, not of the user.
export type DailyOs = 'linux' | 'mac' | 'windows';

export const DAILY_OS_OPTIONS: { value: DailyOs; label: string }[] = [
  { value: 'linux', label: 'Linux' },
  { value: 'mac', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
];

const OS_TO_PLATFORM: Record<DailyOs, Platform> = {
  linux: 'linux',
  mac: 'macos',
  windows: 'windows',
};

export type UserPreferences = {
  /** OS the user works on daily. Empty means "no OS filter". */
  dailyOs: DailyOs[];
  /** 1-5 weight for the synthetic open-source criterion; null when unanswered. */
  opensourceImportance: number | null;
  /** Side metric only — never affects any tool score. null when unanswered. */
  willingToPay: boolean | null;
};

export const EMPTY_PREFERENCES: UserPreferences = {
  dailyOs: [],
  opensourceImportance: null,
  willingToPay: null,
};

function isDailyOs(value: string): value is DailyOs {
  return value === 'linux' || value === 'mac' || value === 'windows';
}

export function rowToPreferences(row: Pick<UserPreferencesRow, 'daily_os' | 'opensource_importance' | 'willing_to_pay'>): UserPreferences {
  return {
    dailyOs: (row.daily_os ?? []).filter(isDailyOs),
    opensourceImportance: row.opensource_importance ?? null,
    willingToPay: row.willing_to_pay ?? null,
  };
}

export async function fetchMyPreferences(supabase: SupabaseClient<Database>): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('daily_os, opensource_importance, willing_to_pay')
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ...EMPTY_PREFERENCES };
  return rowToPreferences(data as Pick<UserPreferencesRow, 'daily_os' | 'opensource_importance' | 'willing_to_pay'>);
}

export async function upsertPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  preferences: UserPreferences,
): Promise<void> {
  const { error } = await supabase.from('user_preferences').upsert(
    {
      user_id: userId,
      daily_os: preferences.dailyOs,
      opensource_importance: preferences.opensourceImportance,
      willing_to_pay: preferences.willingToPay,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

// A tool is kept in the personal ranking when it covers EVERY OS the user works
// on daily. A web tool runs everywhere, so it always passes. An empty selection
// means the user did not narrow anything down — every tool stays.
export function isToolCompatibleWithOs(platforms: Platform[], dailyOs: DailyOs[]): boolean {
  if (dailyOs.length === 0) return true;
  if (platforms.includes('web')) return true;
  return dailyOs.every((os) => platforms.includes(OS_TO_PLATFORM[os]));
}
