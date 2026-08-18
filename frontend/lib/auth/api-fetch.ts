"use client";

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

async function requiresRefresh(response: Response) {
  if (response.status !== 401) return false;

  try {
    const body = (await response.clone().json()) as { error?: string };
    return body.error === "ACCESS_MISSING" || body.error === "ACCESS_EXPIRED";
  } catch {
    return false;
  }
}

// Use this for browser calls to protected API endpoints.
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  let response = await fetch(input, requestInit);

  if (!(await requiresRefresh(response))) return response;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    window.location.assign("/login");
    return response;
  }

  response = await fetch(input, requestInit);
  if (response.status === 401) {
    window.location.assign("/login");
  }

  return response;
}
