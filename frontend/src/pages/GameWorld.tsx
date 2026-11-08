import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import Phaser from "phaser";

const MAP_W = 2200;
const MAP_H = 2200;

interface GameSpot {
  id: number;
  name: string;
  category: string;
  rarity: string;
  x: number;
  y: number;
  cooldown_seconds: number;
  reward_xp: number;
  reward_coins: number;
  is_active: boolean;
  available: boolean;
  available_at?: string;
}

interface GameNPC {
  id: number;
  name: string;
  npc_type: string;
  x: number;
  y: number;
  region: string;
  dialogue: Record<string, any>;
  is_active: boolean;
}

export default function GameWorld() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<any>(null);
  const [modal, setModal] = useState<any>(null);
  const [status, setStatus] = useState("Conectando…");
  const [hud, setHud] = useState<{ xp: number; level: number; coins: number; xpNext: number; name: string } | null>(null);

  const rarityColor = (r: string) => {
    switch (r) {
      case "legendary": return "#a855f7";
      case "epic": return "#c084fc";
      case "rare": return "#818cf8";
      case "uncommon": return "#3b82f6";
      default: return "#10b981";
    }
  };

  const loadHud = useCallback(async () => {
    try {
      const ch = await api.getMyCharacter();
      const prog = await api.getProgress();
      setHud({
        xp: prog?.xp ?? ch?.xp ?? 0,
        level: prog?.level ?? ch?.level ?? 1,
        coins: prog?.coins ?? ch?.coins ?? 0,
        xpNext: prog?.xp_for_next_level ?? ch?.xp_for_next_level ?? 100,
        name: ch?.name || user?.nome || "Jogador",
      });
    } catch { setHud(null); }
  }, [user]);

  const openSpot = useCallback(async (spot: GameSpot) => {
    if (!spot.available) {
      setStatus("Spot em regeneração. Volte mais tarde.");
      setTimeout(() => setStatus(""), 1500);
      return;
    }
    try {
      const acts = await api.getActivities({ category: spot.category, difficulty: "easy" });
      let act = acts.length ? acts[Math.floor(Math.random() * acts.length)] : null;
      if (!act) {
        const gen = await api.generateActivity({ category: spot.category, difficulty: "easy", format: "multiple_choice" });
        act = gen;
      }
      setModal({
        open: true, activity: act, spotId: spot.id, answering: false,
        result: null, feedback: "", xp: spot.reward_xp, coins: spot.reward_coins,
        newXp: 0, newLevel: 1, newCoins: 0, leveledUp: false,
      });
      setStatus(`Atividade: ${act.title}`);
    } catch {
      setStatus("Erro ao carregar atividade");
      setTimeout(() => setStatus(""), 1500);
    }
  }, []);

  const answerActivity = async (selected: string) => {
    const act = modal?.activity;
    const spotId = modal?.spotId;
    if (!act || spotId == null) return;
    setModal((m: any) => ({ ...m, answering: true }));
    try {
      const res = await api.submitActivity({
        activity_id: act.id,
        answer: selected,
        spot_id: spotId,
      });
      setModal((m: any) => ({
        ...m,
        answering: false,
        result: res.is_correct ? "correct" : "wrong",
        feedback: res.explanation || (res.is_correct ? "Correto!" : "Errado."),
        xp: res.xp_earned,
        coins: res.coins_earned,
        newXp: res.new_xp,
        newLevel: res.new_level,
        newCoins: res.new_coins,
        leveledUp: res.leveled_up,
      }));
      await loadHud();
      await refreshUser();
      try { sceneRef.current?.refreshSpots(); } catch {}
      setStatus(res.is_correct ? `+${res.xp_earned} XP +${res.coins_earned} moedas` : "Tente novamente");
    } catch {
      setModal((m: any) => ({ ...m, answering: false, result: "wrong", feedback: "Erro ao enviar resposta." }));
      setStatus("Erro ao concluir atividade");
    }
  };

  const closeModal = () => {
    setModal({ open: false, activity: null, spotId: null, answering: false, result: null, feedback: "", xp: 0, coins: 0, newXp: 0, newLevel: 1, newCoins: 0, leveledUp: false });
    setStatus("");
  };

  function create(this: Phaser.Scene) {
    sceneRef.current = this;
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    const grass = this.add.rectangle(MAP_W / 2, MAP_H / 2, MAP_W, MAP_H, 0x14532d);
    grass.setDepth(-10);
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(60, MAP_W - 60);
      const y = Phaser.Math.Between(60, MAP_H - 60);
      this.add.circle(x, y, 22, 0x0f512a).setStrokeStyle(2, 0x0b3d22);
      this.add.circle(x, y - 16, 16, 0x1a7a47);
    }
    this.add.rectangle(MAP_W / 2, MAP_H / 2 - 300, 700, 24, 0x5d4037).setDepth(-5);
    this.add.rectangle(MAP_W / 2 - 400, MAP_H / 2 + 200, 24, 700, 0x5d4037).setDepth(-5);
    const spots: GameSpot[] = [];
    const spotSprites = this.add.group();

    const loadSpots = async () => {
      try {
        const data = await api.getSpots();
        spots.length = 0;
        spotSprites.clear(true, true);
        data.forEach((s: any) => {
          const spot: GameSpot = {
            id: s.id, name: s.name, category: s.category, rarity: s.rarity,
            x: s.x, y: s.y, cooldown_seconds: s.cooldown_seconds,
            reward_xp: s.reward_xp, reward_coins: s.reward_coins,
            is_active: s.is_active, available: s.available,
            available_at: s.available_at,
          };
          spots.push(spot);
          const col = rarityColor(spot.rarity);
          const marker = this.add.circle(spot.x, spot.y, 14, parseInt(col.replace("#", ""), 16));
          marker.setStrokeStyle(2, 0xffffff);
          marker.setDepth(5);
          const pulse = this.add.circle(spot.x, spot.y, 14, parseInt(col.replace("#", ""), 16));
          pulse.setAlpha(0.35);
          pulse.setDepth(4);
          this.tweens.add({
            targets: pulse,
            scale: { from: 1, to: 2.2 },
            alpha: { from: 0.35, to: 0 },
            duration: 1400,
            repeat: -1,
          });
          this.add.text(spot.x, spot.y - 22, spot.name, {
            fontSize: "12px", color: "#e2e8f0", stroke: "#0f172a", strokeThickness: 3,
          }).setOrigin(0.5).setDepth(6);
          if (!spot.available) {
            const lock = this.add.text(spot.x, spot.y - 38, "⏳", { fontSize: "14px" }).setOrigin(0.5).setDepth(6);
            this.tweens.add({ targets: lock, y: lock.y - 8, alpha: 0, duration: 900, yoyo: true, repeat: -1 });
          }
          spotSprites.addMultiple([marker, pulse]);
        });
        setStatus(data.length ? `${data.length} spots no mapa` : "Nenhum spot encontrado");
      } catch {
        setStatus("Erro ao carregar spots");
      }
    };

    (this as any).refreshSpots = loadSpots;
    loadSpots();

    api.getNPCs().then((data: any) => {
      data.forEach((n: any) => {
        const c = n.npc_type === "guide" ? 0x10b981 : n.npc_type === "teacher" ? 0x3b82f6 : n.npc_type === "challenger" ? 0xef4444 : 0xa855f7;
        this.add.circle(n.x, n.y, 16, c).setStrokeStyle(2, 0xffffff).setDepth(5);
        this.add.text(n.x, n.y - 24, n.name, {
          fontSize: "11px", color: "#e2e8f0", stroke: "#0f172a", strokeThickness: 3,
        }).setOrigin(0.5).setDepth(6);
        this.add.text(n.x, n.y + 22, "⚡", { fontSize: "10px" }).setOrigin(0.5).setDepth(6);
      });
    }).catch(() => {});

    const char = this.add.circle(MAP_W / 2, MAP_H / 2, 10, 0xfbbf24);
    char.setStrokeStyle(2, 0xffffff);
    this.physics.add.existing(char);
    (char.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    const charName = this.add.text(MAP_W / 2, MAP_H / 2 - 22, user?.nome || "Jogador", {
      fontSize: "12px", color: "#ffffff", stroke: "#0f172a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);

    const cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys("W,A,S,D") as any;

    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.startFollow(char, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.1);

    const speed = 160;
    let joy = { x: 0, y: 0, active: false };

    const interact = async () => {
      const cx = char.x;
      const cy = char.y;
      const near = spots.find(s => {
        const d = Math.hypot(s.x - cx, s.y - cy);
        return d < 45 && s.available;
      });
      if (near) {
        openSpot(near);
      } else {
        setStatus("Não há atividade próxima");
        setTimeout(() => setStatus(""), 1200);
      }
    };
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E).on("down", interact);
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", interact);

    function update(this: Phaser.Scene, _t: number, dt: number) {
      if (!char || !char.body) return;
      const body = char.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0);
      let vx = 0;
      let vy = 0;
      if (cursors.left?.isDown || wasd.A?.isDown) vx = -1;
      if (cursors.right?.isDown || wasd.D?.isDown) vx = 1;
      if (cursors.up?.isDown || wasd.W?.isDown) vy = -1;
      if (cursors.down?.isDown || wasd.S?.isDown) vy = 1;
      if (joy.active) {
        vx = joy.x;
        vy = joy.y;
      }
      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        body.setVelocity((vx / len) * speed, (vy / len) * speed);
        charName.setPosition(char.x, char.y - 22);
      }
    }

    (this as any).resizeGame = (w: number, h: number) => {
      this.scale.resize(w, h);
    };
    (this as any).setJoy = (dx: number, dy: number) => {
      const len = Math.hypot(dx, dy) || 1;
      joy.active = true;
      joy.x = dx / len;
      joy.y = dy / len;
    };
    (this as any).stopJoy = () => { joy.active = false; joy.x = 0; joy.y = 0; };
  }

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto rpg-panel p-3 flex items-center gap-3 min-w-[220px]">
          <div className="w-8 h-8 rounded-full bg-[#fbbf24] flex items-center justify-center text-xs font-bold text-[#0f172a] shrink-0">
            {user?.nome?.[0] || "J"}
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-bold text-[#e2e8f0]">{user?.nome || "Jogador"}</div>
            <div className="text-[10px] text-[#94a3b8]">Nv. {hud?.level ?? 1} · {hud?.coins ?? 0} moedas</div>
          </div>
        </div>
        <div className="pointer-events-auto rpg-panel p-3 flex items-center gap-3">
          <div className="w-16 bg-[#334155] rounded h-2 overflow-hidden border border-[#475569]">
            <div className="xp-fill" style={{ width: hud ? `${Math.min(100, ((hud.xp % hud.xpNext) / hud.xpNext) * 100)}%` : "0%" }} />
          </div>
          <div className="text-[10px] font-bold text-[#fbbf24] w-16 text-right">
            {hud ? `${hud.xp % hud.xpNext} / ${hud.xpNext}` : "— / —"}
          </div>
          <div className="text-[10px] text-[#94a3b8]">XP</div>
        </div>
      </div>

      {status && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-[#0f172a]/90 border border-[#334155] text-[#e2e8f0] text-xs backdrop-blur shadow-xl">
          {status}
        </div>
      )}

      <div id="game-container" className="game-canvas flex-grow relative" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 text-[10px] text-[#64748b] pointer-events-none">
        <span>WASD / Setas · Mover</span>
        <span className="px-2 py-0.5 rounded bg-[#334155] border border-[#475569]">E / Espaço · Interagir</span>
      </div>

      {modal && modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rpg-panel w-full max-w-sm p-5 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 rpg-btn-outline text-xs p-1"
            >
              ✕
            </button>
            <h3 className="text-[#fbbf24] font-bold text-lg mb-2">{modal.activity?.title}</h3>
            <div className="text-xs text-[#94a3b8] mb-3">
              {modal.activity?.category} · {modal.activity?.difficulty}
            </div>

            {!modal.answering && modal.activity?.content && (
              <div className="space-y-3">
                <div className="text-[#e2e8f0] text-sm leading-relaxed">
                  {typeof modal.activity.content === "object" && modal.activity.content.question
                    ? modal.activity.content.question
                    : JSON.stringify(modal.activity.content)}
                </div>
                {Array.isArray(modal.activity.content?.options) && (
                  <div className="grid grid-cols-1 gap-2">
                    {modal.activity.content.options.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => answerActivity(opt)}
                        className="rpg-btn-outline text-left text-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {modal.answering && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`text-lg font-bold ${modal.result === "correct" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {modal.result === "correct" ? "✔ Correto!" : "✘ Errado"}
                </div>
                <p className="text-xs text-[#94a3b8]">{modal.feedback}</p>
                {modal.xp > 0 && (
                  <div className="text-[#fbbf24] font-bold text-sm">+{modal.xp} XP · +{modal.coins} moedas</div>
                )}
                {modal.leveledUp && (
                  <div className="text-[#a855f7] font-bold text-sm animate-bounce">⬆️ Subiu de nível!</div>
                )}
                <button
                  onClick={closeModal}
                  className="rpg-btn-primary mt-3"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

