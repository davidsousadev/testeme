import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, setAccessToken } from "../lib/api";

export default function Login() {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(nick, password);
      navigate("/game");
    } catch (err: any) {
      setError(err?.response?.detail || err?.message || "Erro ao entrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="rpg-panel w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🧠</span>
          <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#94a3b8] font-medium">Nick</label>
            <input
              className="rpg-input"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Seu nick"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#94a3b8] font-medium">Senha</label>
            <input
              className="rpg-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rpg-btn-primary w-full"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className="text-[#fbbf24] font-medium underline hover:opacity-80"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
