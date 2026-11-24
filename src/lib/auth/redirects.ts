const dashboardPath = "/dashboard";
const privatePages = new Set([dashboardPath, "/clientes", "/oportunidades", "/pipeline"]);
const internalOrigin = "https://clientflow.invalid";

export function getPrivateDestination(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\") ||
      /\p{Cc}/u.test(value)) {
    return dashboardPath;
  }

  const destination = URL.parse(value, internalOrigin);
  if (!destination || destination.origin !== internalOrigin || value.startsWith("//") ||
      (!privatePages.has(destination.pathname) && !/^\/clientes\/[A-Za-z0-9-]+$/.test(destination.pathname))) {
    return dashboardPath;
  }

  destination.searchParams.delete("_rsc");
  return `${destination.pathname}${destination.search}`;
}
