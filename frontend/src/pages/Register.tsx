import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("As senhas não conferem!");
      return;
    }
    setSubmitting(true);
    try {
      await register({ nome, nick, password, email });
      setSuccess("Cadastro realizado com sucesso! Faça login.");
      setNome("");
      setNick("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
    } catch (err: any) {
      setError(err?.body?.detail || err?.message || "Erro ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="rpg-panel w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🧠</span>
          <h2 className="text-2xl font-bold tracking-tight">Criar conta</h2>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#94a3b8] font-medium">Nome</label>
            <input
              className="rpg-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
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
            <label className="text-sm text-[#94a3b8] font-medium">E-mail (opcional)</label>
            <input
              className="rpg-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
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
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#94a3b8] font-medium">Confirmar senha</label>
            <input
              className="rpg-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rpg-btn-primary w-full"
          >
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#fbbf24] font-medium underline hover:opacity-80"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
