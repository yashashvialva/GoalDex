import { UoMType } from '@/lib/types';

/**
 * Calculate progress score based on Unit of Measurement type.
 *
 * Min (Higher is better): achievement / target * 100
 * Max (Lower is better): target / achievement * 100
 * Timeline: completion_date vs deadline ratio
 * Zero-based: if achievement === 0 → 100%, else 0%
 */
export function calculateProgressScore(
  uomType: UoMType,
  target: number,
  achievement: number
): number {
  if (target === 0 && uomType !== 'zero_based') return 0;

  switch (uomType) {
    case 'numeric':
    case 'percentage':
      // Higher is better
      return Math.min(Math.round((achievement / target) * 100), 100);

    case 'timeline':
      // Lower is better (e.g. days taken vs days planned)
      if (achievement === 0) return 100; // completed instantly
      return Math.min(Math.round((target / achievement) * 100), 100);

    case 'zero_based':
      // Zero is the goal
      return achievement === 0 ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Get weighted score for a goal
 */
export function getWeightedScore(
  progressScore: number,
  weightage: number
): number {
  return Math.round((progressScore * weightage) / 100);
}

/**
 * Calculate overall goal sheet score
 */
export function calculateSheetScore(
  goals: { progress_score: number; weightage: number }[]
): number {
  return goals.reduce(
    (total, goal) => total + getWeightedScore(goal.progress_score, goal.weightage),
    0
  );
}

/**
 * Format score with color
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/**
 * Get UoM display label
 */
export function getUoMLabel(uomType: UoMType): string {
  const labels: Record<UoMType, string> = {
    numeric: 'Numeric (Higher is better)',
    percentage: 'Percentage (Higher is better)',
    timeline: 'Timeline (Lower is better)',
    zero_based: 'Zero-based (Zero = 100%)',
  };
  return labels[uomType];
}
