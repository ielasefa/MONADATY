export function adminLoginDestination(requested: string | null | undefined, mustChangePassword: boolean): string {
  if (mustChangePassword) return "/admin/change-password";
  if (requested?.startsWith("/admin/") && !requested.includes("\\")) {
    try {
      const url = new URL(requested, "https://monadaty.invalid");
      if (url.origin === "https://monadaty.invalid" && url.pathname.startsWith("/admin/") &&
        url.pathname.replace(/\/+$/, "") !== "/admin/login") {
        return url.pathname + url.search + url.hash;
      }
    } catch { /* Use the dashboard for an invalid destination. */ }
  }
  return "/admin/dashboard";
}
