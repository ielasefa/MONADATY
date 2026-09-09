export function createLatestRequestGuard() {
  let latest = 0;
  return {
    begin(): number {
      latest += 1;
      return latest;
    },
    isCurrent(requestId: number): boolean {
      return requestId === latest;
    },
  };
}
