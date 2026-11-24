export function getSupabaseConfigOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const endpoint = URL.parse(url ?? "");
  const isLoopback = endpoint && ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);

  if (!endpoint || endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
      (endpoint.protocol !== "https:" && !(isLoopback && endpoint.protocol === "http:")) ||
      !key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) || key === "sb_publishable_example") {
    return null;
  }

  return { url: endpoint.href, key };
}

export function getSupabaseConfig() {
  const config = getSupabaseConfigOrNull();
  if (!config) throw new Error("Configuración pública de Supabase ausente o no válida.");
  return config;
}
