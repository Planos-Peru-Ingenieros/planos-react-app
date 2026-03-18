export function useCharacterCount(value, maxLength) {
  const count = value?.length || 0
  const remaining = maxLength - count
  const isNearLimit = remaining <= 15
  const isOverLimit = remaining < 0

  return { count, remaining, isNearLimit, isOverLimit }
}
