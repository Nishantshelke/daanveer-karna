const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiFetch(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function redirectUrl(slug) {
  return `${API_BASE}/platforms/${slug}/redirect/`;
}
