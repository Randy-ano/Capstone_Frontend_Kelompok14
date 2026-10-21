import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Saat halaman dimuat ulang, sesi dipulihkan dari token yang tersimpan lewat GET /auth/me.
  const [loading, setLoading] = useState(() => tokenStore.get() !== null);

  useEffect(() => {
    if (!tokenStore.get()) return;

    api("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Login dan registrasi sama-sama mengembalikan { token, user }; sesi disimpan dengan cara yang sama.
  const mulaiSesi = useCallback((res) => {
    tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback(
    async (email, password) => mulaiSesi(await api("/auth/login", { method: "POST", body: { email, password } })),
    [mulaiSesi],
  );

  // jenis: "talent" → POST /auth/register/talent, "hr-client" → POST /auth/register/hr-client.
  const register = useCallback(
    async (jenis, data) => mulaiSesi(await api(`/auth/register/${jenis}`, { method: "POST", body: data })),
    [mulaiSesi],
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return context;
}
