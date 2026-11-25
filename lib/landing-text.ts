/** Localize bundled seed copy while keeping authored CMS overrides visible. */
export function landingText(value: string | undefined, fallback: string, seeds: readonly string[] = []) {
  const text = value?.trim();
  return text && !seeds.includes(text) ? text : fallback;
}
