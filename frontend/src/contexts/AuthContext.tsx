import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getAccessToken, setAccessToken } from "../lib/api";

interface AuthUser {
  nick: string;
  nome: string;
  email?: string | null;
  score?: number;
  xp?: number;
  level?: number;
  coins?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (nick: string, password: string) => Promise<void>;
  register: (data: { nome: string; nick: string; password: string; email?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = getAccessToken();
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      api.me()
        .then((u) => setUser(u))
        .catch(() => {
          setAccessToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (nick: string, password: string) => {
    const data = await api.login({ nick, password });
    setAccessToken(data.access_token);
    setUser(data.user);
  };

  const register = async (data: {
    nome: string;
    nick: string;
    password: string;
    email?: string;
  }) => {
    await api.register(data);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    const u = await api.me();
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
