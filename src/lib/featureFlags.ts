export const FEATURES = {
  feed: false,
  groups: false,
  followUsers: false,
  groupLeaderboard: false,
  photoCapture: false,
  performanceChart: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key]
}
