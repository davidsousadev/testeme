import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyCharacter()
      .then(setCharacter)
      .catch(() => setCharacter(null));
    api.getProgress().then(setProgress).catch(() => setProgress(null));
    api.getAchievements()
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, []);

  const xpPct = character?.xp && character?.xp_for_next_level
    ? Math.min(100, (character.xp % character.xp_for_next_level) / character.xp_for_next_level * 100)
    : 0;

  if (loading) return <div className="p-4 text-[#94a3b8]">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={() => navigate("/game")}
            className="rpg-btn-outline flex items-center gap-2"
          >
            ⬅️ Voltar ao mundo
          </button>
          <button
            onClick={() => navigate("/ranking")}
            className="rpg-btn-outline flex items-center gap-2 ml-auto"
          >
            🏆 Ver ranking
          </button>
        </div>

        <div className="rpg-panel p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center text-4xl mb-4 md:mb-0">
              {character?.name?.[0] || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="text-3xl font-bold">{character?.name || "—"}</h2>
                <span className="text-[#fbbf24] font-bold">Nv. {character?.level || 1}</span>
              </div>
              <p className="text-[#94a3b8]">@{user?.nick}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#10b981]">{character?.coins ?? 0} <span className="text-xs text-[#94a3b8] ml-1">moedas</span></div>
              <div className="text-xs text-[#94a3b8]">XP: {character?.xp ?? 0}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-[#94a3b8] mb-1">
              <span>Experiência</span>
              <span>{character?.xp ?? 0} / {character?.xp_for_next_level ?? 100}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rpg-panel p-4">
            <h3 className="text-[#fbbf24] font-semibold mb-3">Conquistas</h3>
            {achievements.length === 0 ? (
              <p className="text-xs text-[#94a3b8]">Nenhuma conquista ainda.</p>
            ) : (
              <ul className="space-y-2">
                {achievements.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-5 h-5 rounded-full ${a.unlocked ? "bg-[#10b981]" : "bg-[#334155]"} flex-shrink-0`} />
                    <span className={a.unlocked ? "text-[#e2e8f0]" : "text-[#475569]"}>
                      {a.name} {a.unlocked ? "✓" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rpg-panel p-4">
            <h3 className="text-[#3b82f6] font-semibold mb-3">Progresso</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#e2e8f0]">
                <span>Nível:</span>
                <span>{progress?.level ?? character?.level ?? 1}</span>
              </div>
              <div className="flex justify-between text-[#e2e8f0]">
                <span>XP:</span>
                <span>{progress?.xp ?? character?.xp ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#e2e8f0]">
                <span>Moedas:</span>
                <span>{progress?.coins ?? character?.coins ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#e2e8f0]">
                <span>Atividades concluídas:</span>
                <span>{progress?.activities_completed ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#e2e8f0]">
                <span>Conquistas:</span>
                <span>{progress?.achievements_unlocked ?? achievements.filter(a => a.unlocked).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
