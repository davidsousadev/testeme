import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/game");
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-[#f1f5f9] p-6">
      <div className="flex flex-col items-center gap-4 max-w-2xl">
        <div className="w-20 h-20 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center mb-2">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-balance tracking-tight">
          TestMe
        </h1>
        <p className="text-[#94a3b8] text-lg md:text-xl text-center max-w-md">
          Aprendizagem gamificada. Explore o Mundo do Conhecimento, resolva
          desafios, evolua seu personagem e suba no ranking.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-6">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/game")}
              className="rpg-btn-primary w-full sm:w-auto"
            >
              Entrar no Mundo
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rpg-btn-primary w-full sm:w-auto"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="rpg-btn-outline w-full sm:w-auto"
              >
                Criar conta
              </button>
            </>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#94a3b8]">
          <div className="rpg-panel p-4">
            <div className="text-[#fbbf24] font-bold mb-1">⚔️ Exploração</div>
            <div className="text-xs">Mapa interativo com pontos de atividade</div>
          </div>
          <div className="rpg-panel p-4">
            <div className="text-[#10b981] font-bold mb-1">📈 Progressão</div>
            <div className="text-xs">XP, níveis, moedas e conquistas</div>
          </div>
          <div className="rpg-panel p-4">
            <div className="text-[#3b82f6] font-bold mb-1">🏆 Ranking</div>
            <div className="text-xs">Compita com outros jogadores</div>
          </div>
        </div>
      </div>
    </div>
  );
}
