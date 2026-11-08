import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

const rarityColor = (r: string) => {
  switch (r) {
    case "legendary": return "#a855f7";
    case "epic": return "#c084fc";
    case "rare": return "#818cf8";
    case "uncommon": return "#3b82f6";
    default: return "#10b981";
  }
};

export default function Ranking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<any[]>([]);
  const [kind, setKind] = useState<"global" | "weekly" | "monthly">("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRanking(kind)
      .then(setRanking)
      .catch(() => setRanking([]))
      .finally(() => setLoading(false));
  }, [kind]);

  const label = (k: string) => (k === "global" ? "Geral" : k === "weekly" ? "Semanal" : "Mensal");

  return (
    <div className="min-h-screen bg-[#0f172a] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/game")}
            className="rpg-btn-outline flex items-center gap-2"
          >
            ⬅️ Voltar ao mundo
          </button>
          <div className="ml-auto flex gap-2">
            {["global", "weekly", "monthly"].map((k) => (
              <button
                key={k}
                onClick={() => setKind(k as "global" | "weekly" | "monthly")}
                className={kind === k
                  ? "px-3 py-1.5 rounded text-xs font-medium border bg-[#334155] border-[#fbbf24] text-[#fbbf24]"
                  : "px-3 py-1.5 rounded text-xs font-medium border border-[#334155] text-[#94a3b8]"
                }
              >
                {label(k)}
              </button>
            ))}
          </div>
        </div>

        <div className="rpg-panel overflow-hidden">
          <table className="w-full text-left border-b border-[#334155]">
            <thead>
              <tr className="bg-[#1e293b] text-[#94a3b8] text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Pos.</th>
                <th className="px-4 py-3 font-medium">Jogador</th>
                <th className="px-4 py-3 font-medium">Nível</th>
                <th className="px-4 py-3 font-medium">XP</th>
                <th className="px-4 py-3 font-medium">Atividades</th>
                <th className="px-4 py-3 font-medium">Moedas</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className="p-4 text-[#94a3b8]">Carregando...</td></tr>
                : ranking.length === 0
                ? <tr><td colSpan={6} className="p-4 text-[#94a3b8]">Sem jogadores no ranking ainda.</td></tr>
                : ranking.map((r, i) => {
                    const me = r.nick === user?.nick;
                    return (
                      <tr key={r.nick} className={`border-b border-[#334155]/50 ${me ? "bg-[#fbbf24]/10" : ""} hover:bg-[#334155]/30 transition`}>
                        <td className="px-4 py-3 font-bold">{i + 1}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full bg-[#334155] flex items-center justify-center text-[10px] font-bold border border-[${rarityColor(r.rarity || "common")}]`}>
                            {r.name?.[0] || "?"}
                          </span>
                          <span className={me ? "text-[#fbbf24] font-semibold" : "text-[#e2e8f0]"}>
                            {r.name} {me ? "(você)" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{r.level ?? 1}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{r.xp ?? 0}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{r.activities_completed ?? 0}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{r.coins ?? 0}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
