import { FEATURES } from '../data';
import type { Feature } from '../data/schema';

export function isRatableFeature(feature: Feature): boolean {
  return (feature.status ?? 'approved') === 'approved';
}

export const RATABLE_FEATURES = FEATURES.filter(isRatableFeature);
