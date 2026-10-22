// Client REST API backend Intellisys (Laravel, prefix /api/v1, auth Bearer token Sanctum).

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const TOKEN_KEY = "intellisys_token";

export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// `blob: true` mengembalikan isi response sebagai Blob (mis. unduh PDF); error tetap dibaca sebagai JSON.
export async function api(path, { method = "GET", body, blob = false } = {}) {
  const headers = { Accept: "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  // FormData (unggah file) dikirim apa adanya; browser yang mengisi Content-Type multipart.
  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined || multipart ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.");
  }

  if (blob && response.ok) return response.blob();

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) tokenStore.clear();
    throw new ApiError(response.status, data?.message ?? "Terjadi kesalahan pada server.", data?.errors ?? {});
  }

  return data;
}
