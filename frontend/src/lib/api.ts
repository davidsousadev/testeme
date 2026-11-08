const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/testeme";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request(path: string, opts: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });
  return res;
}

export async function json<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await request(path, opts);
  let body: any = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    const text = await res.text();
    body = text ? { detail: text } : { detail: `HTTP ${res.status}` };
  }
  if (!res.ok) {
    const err: any = new Error(body?.detail || `Request failed ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

export const api = {
  register: (data: { nome: string; nick: string; password: string; email?: string }) =>
    json<{ detail: string }>("/cadastrar", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { nick: string; password: string }) =>
    json<{ access_token: string; refresh_token: string; user: any }>("/logar", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => json<any>("/autenticar"),
  getMyCharacter: () => json<any>("/characters/me"),
  createCharacter: (data: { name: string; avatar?: string }) =>
    json<any>("/characters", { method: "POST", body: JSON.stringify(data) }),
  updateCharacter: (data: { name: string; avatar?: string }) =>
    json<any>("/characters/me", { method: "PUT", body: JSON.stringify(data) }),
  getSpots: () => json<any[]>("/world/spots"),
  getSpot: (id: number) => json<any>(`/world/spots/${id}`),
  getMap: () => json<any>("/world/map"),
  getActivities: (params?: { category?: string; difficulty?: string }) => {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return json<any[]>(`/activities${qs}`);
  },
  getActivity: (id: number) => json<any>(`/activities/${id}`),
  startActivity: (id: number) => json<any>(`/activities/${id}/start`, { method: "POST" }),
  submitActivity: (data: {
    activity_id: number;
    answer: string;
    time_taken_seconds?: number;
    spot_id?: number;
  }) => json<any>(`/activities/${data.activity_id}/submit`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getHistory: () => json<any[]>("/activities/history"),
  getProgress: () => json<any>("/progress/me"),
  getAchievements: () => json<any[]>("/progress/achievements"),
  getRanking: (kind: "global" | "weekly" | "monthly" = "global") =>
    json<any[]>(`/ranking/${kind}`),
  getNPCs: () => json<any[]>("/npcs"),
  getNotifications: () => json<any[]>("/notifications"),
  markNotificationRead: (id: number) =>
    json<any>(`/notifications/${id}/read`, { method: "POST" }),
  generateActivity: (data: { category: string; difficulty?: string; format?: string }) =>
    json<any>("/ai/generate-activity", { method: "POST", body: JSON.stringify(data) }),
  generatePuzzle: (data: { difficulty?: string; topic?: string }) =>
    json<any>("/ai/generate-puzzle", { method: "POST", body: JSON.stringify(data) }),
  getHint: (data: { activity_id: number; attempt_number?: number }) =>
    json<any>("/ai/get-hint", { method: "POST", body: JSON.stringify(data) }),
  verifyEmail: (token: string) =>
    json<{ detail: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  forgotPassword: (email: string) =>
    json<{ detail: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, new_password: string) =>
    json<{ detail: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),
};
