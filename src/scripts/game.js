(() => {
  'use strict';

  const metaApi = document.querySelector('meta[name="testme-api"]')?.content;
  const queryApi = new URLSearchParams(window.location.search).get('api');
  const API_URL = (queryApi || metaApi || '[http://127.0.0.1:8000/testeme](http://127.0.0.1:8000/testeme)').replace(/\/$/, '');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  
  const state = {
    token: sessionStorage.getItem('testme_access_token') || '',
    user: null,
    character: null,
    progress: null,
    spots: [],
    npcs: [],
    activeSpot: null,
    activeActivity: null,
    attemptStartedAt: null,
    selectedAnswer: null,
    nearest: null,
    autoTarget: null,
    player: { x: 145, y: 160, speed: 245 },
    keys: new Set(),
    lastFrame: 0,
    animationFrame: 0,
    mapSize: { width: 2000, height: 1200 },
    isSubmitting: false,
  };

  const rarityNames = { common: 'Comum', uncommon: 'Incomum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário' };
  const rarityIcons = { common: '✧', uncommon: '✦', rare: '❖', epic: '✹', legendary: '✺' };
  const rarityRank = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function toast(message, type = 'info') {
    const node = document.createElement('div');
    node.className = `toast ${ type } `;
    node.textContent = message;
    $('#toastRegion').appendChild(node);
    window.setTimeout(() => node.remove(), 4200);
  }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (state.token && options.auth !== false) headers.Authorization = `Bearer ${ state.token } `;
    const response = await fetch(`${ API_URL }${ path } `, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();
    
    if (!response.ok || (options.auth !== false && state.token && data && !Array.isArray(data) && typeof data === 'object' && data.detail && /não autorizado|nao autorizado|token inválido|token invalido|token expirado/i.test(data.detail))) {
      const message = data && data.detail ? data.detail : `Falha na API(${ response.status })`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setConnection(status, label) {
    const el = $('#connectionStatus');
    el.classList.toggle('online', status === 'online');
    el.classList.toggle('offline', status === 'offline');
    el.innerHTML = `< i ></ > ${ escapeHTML(label) } `;
  }

  function showAuth(tab = 'login') {
    $('#authScreen').classList.remove('hidden');
    $('#gameScreen').classList.add('hidden');
    $('#topUser').classList.add('hidden');
    selectAuthTab(tab);
  }

  function showGame() {
    $('#authScreen').classList.add('hidden');
    $('#gameScreen').classList.remove('hidden');
    $('#topUser').classList.remove('hidden');
    $('#topNick').textContent = state.user?.nick || 'Aventureiro';
    $('#mapPlayerName').textContent = state.character?.name || state.user?.nome || 'Você';
    $('#playerName').textContent = state.character?.name || state.user?.nome || 'Aventureiro';
    $('#playerNick').textContent = `@${ state.user?.nick || '' } `;
  }

  function selectAuthTab(tab) {
    const register = tab === 'register';
    $$('.auth-tab').forEach(button => {
      const active = button.dataset.authTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $('#loginForm').classList.toggle('hidden', register);
    $('#registerForm').classList.toggle('hidden', !register);
    $('#authTitle').textContent = register ? 'Sua aventura começa aqui' : 'Bem-vindo de volta';
    $('#authSubtitle').textContent = register ? 'Crie sua conta e prepare seu personagem.' : 'Entre para continuar sua jornada.';
  }

  function storeTokens(data) {
    state.token = data.access_token;
    sessionStorage.setItem('testme_access_token', state.token);
  }

  function clearTokens() {
    state.token = '';
    state.autoTarget = null;
    state.user = null;
    state.character = null;
    state.progress = null;
    sessionStorage.removeItem('testme_access_token');
    stopMovement();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const submit = $('button[type="submit"]', event.currentTarget);
    submit.disabled = true;
    try {
      const data = await api('/logar', {
        method: 'POST', auth: false,
        body: JSON.stringify({ nick: $('#loginNick').value.trim(), password: $('#loginPassword').value }),
      });
      if (!data.access_token) throw new Error(data.detail || 'Não foi possível entrar.');
      storeTokens(data);
      state.user = data.user || null;
      await enterWorld();
      toast('Bem-vindo de volta ao Mundo do Conhecimento!', 'success');
    } catch (error) {
      toast(error.message || 'Não foi possível conectar à API.', 'error');
    } finally {
      submit.disabled = false;
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const submit = $('button[type="submit"]', event.currentTarget);
    const name = $('#registerName').value.trim();
    const nick = $('#registerNick').value.trim();
    const email = $('#registerEmail').value.trim();
    const password = $('#registerPassword').value;
    const confirm = $('#registerPasswordConfirm').value;
    
    if (password !== confirm) return toast('As senhas não conferem.', 'error');
    if (password.length < 8) return toast('Use uma senha com pelo menos 8 caracteres.', 'error');
    
    submit.disabled = true;
    try {
      await api('/cadastrar', {
        method: 'POST', auth: false,
        body: JSON.stringify({ nome: name, nick, email: email || null, password }),
      });
      const data = await api('/logar', {
        method: 'POST', auth: false,
        body: JSON.stringify({ nick, password }),
      });
      if (!data.access_token) throw new Error(data.detail || 'Conta criada, mas não foi possível entrar automaticamente.');
      storeTokens(data);
      state.user = data.user || null;
      await enterWorld();
      toast('Conta criada! Seu personagem está pronto.', 'success');
    } catch (error) {
      toast(error.message || 'Não foi possível criar sua conta.', 'error');
    } finally {
      submit.disabled = false;
    }
  }

  async function enterWorld() {
    setConnection('online', 'API conectada');
    try {
      const [user, character, progress, map, spots, npcs] = await Promise.all([
        api('/users/me'), 
        api('/characters/me'), 
        api('/progress/me'), 
        api('/world/map', { auth: false }), 
        api('/world/spots', { auth: false }), 
        api('/npcs', { auth: false }),
      ]);
      
      state.user = { nick: user.nick, nome: user.nome, email: user.email || null };
      state.character = character;
      state.progress = progress;
      state.mapSize = { width: Number(map.width) || 2000, height: 1200 };
      state.spots = Array.isArray(spots) ? spots : [];
      state.npcs = Array.isArray(npcs) ? npcs : [];
      
      showGame();
      renderProgress();
      renderWorldObjects();
      renderQuestPanel();
      setView('world');
      placePlayer(state.player.x, state.player.y, true);
      $('#worldViewport').focus({ preventScroll: true });
      startMovement();
    } catch (error) {
      setConnection('offline', 'Falha na autenticação');
      clearTokens();
      showAuth('login');
      toast(`Não foi possível carregar seu personagem: ${ error.message } `, 'error');
      throw error;
    }
  }

  function renderProgress() {
    const character = state.character || {};
    const progress = state.progress || {};
    const xp = Number(character.xp ?? progress.xp ?? 0);
    const next = Number(character.xp_for_next_level ?? progress.xp_for_next_level ?? 316);
    const level = Number(character.level ?? progress.level ?? 1);
    const coins = Number(character.coins ?? progress.coins ?? 0);
    
    $('#playerLevel').textContent = level;
    $('#xpLabel').textContent = `${ xp } / ${next} XP`;
$('#playerXp').textContent = xp.toLocaleString('pt-BR');
$('#playerCoins').textContent = coins.toLocaleString('pt-BR');
$('#xpBar').style.width = `${Math.min(100, next > 0 ? (xp / next) * 100 : 0)}%`;
$('#activitiesDone').textContent = progress.activities_completed ?? 0;
$('#achievementsDone').textContent = progress.achievements_unlocked ?? 0;
$('#firstQuestProgress').style.width = `${(progress.activities_completed ?? 0) > 0 ? 100 : 0}%`;
$('#firstQuestLabel').textContent = `${Math.min(progress.activities_completed ?? 0, 1)}/1 atividade concluída`;
$('#playerAvatar').textContent = '♟';
$('#topAvatar').textContent = '✦';
  }

function renderWorldObjects() {
  const container = $('#worldObjects');
  container.innerHTML = '';

  state.spots.forEach(spot => {
    const rarity = rarityRank[spot.rarity] ? spot.rarity : 'common';
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `map-object spot ${rarity} ${spot.available ? '' : 'unavailable'}`;
    marker.style.left = `${Number(spot.x) || 0}px`;
    marker.style.top = `${Number(spot.y) || 0}px`;
    marker.dataset.kind = 'spot';
    marker.dataset.id = spot.id;
    marker.title = `${spot.name} — ${spot.available ? 'Disponível' : 'Em regeneração'}`;
    marker.innerHTML = `<span class="spot-symbol">${rarityIcons[rarity]}</span><span class="map-object-label">${escapeHTML(spot.name)}</span>`;
    marker.addEventListener('click', () => focusTarget({ kind: 'spot', item: spot }));
    container.appendChild(marker);
  });

  state.npcs.forEach(npc => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'map-object npc';
    marker.style.left = `${Number(npc.x) || 0}px`;
    marker.style.top = `${Number(npc.y) || 0}px`;
    marker.dataset.kind = 'npc';
    marker.dataset.id = npc.id;
    marker.title = npc.name;
    marker.innerHTML = `<span class="spot-symbol">♙</span><span class="map-object-label">${escapeHTML(npc.name)}</span>`;
    marker.addEventListener('click', () => focusTarget({ kind: 'npc', item: npc }));
    container.appendChild(marker);
  });
}

function renderQuestPanel() {
  const spots = [...state.spots].sort((a, b) => (rarityRank[b.rarity] || 1) - (rarityRank[a.rarity] || 1)).slice(0, 5);
  $('#nearbySpots').innerHTML = spots.length ? spots.map(spot => {
    const available = Boolean(spot.available);
    const rare = ['rare', 'epic', 'legendary'].includes(spot.rarity);
    return `<button class="nearby-spot ${rare ? 'rare' : ''}" type="button" data-spot-id="${Number(spot.id)}"><span class="nearby-spot-icon">${rarityIcons[spot.rarity] || '✧'}</span><span><strong>${escapeHTML(spot.name)}</strong><small>${escapeHTML(spot.category)} · ${rarityNames[spot.rarity] || 'Comum'}</small></span><span class="spot-state ${available ? '' : 'cooldown'}">${available ? 'Disponível' : 'Regenerando'}</span></button>`;
  }).join('') : '<div class="empty-note">Nenhum spot cadastrado no mundo.</div>';

  $$('.nearby-spot').forEach(button => button.addEventListener('click', () => {
    const spot = state.spots.find(item => Number(item.id) === Number(button.dataset.spotId));
    if (spot) focusTarget({ kind: 'spot', item: spot });
  }));

  $('#npcList').innerHTML = state.npcs.length ? state.npcs.slice(0, 4).map(npc => `<div class="npc-row"><span class="npc-mini">♙</span><span><strong>${escapeHTML(npc.name)}</strong><small>${escapeHTML(npc.npc_type || 'Habitante')} · NPC</small></span></div>`).join('') : '<div class="empty-note">Nenhum NPC encontrado.</div>';
}

function setView(view) {
  const map = view === 'world';
  state.keys.clear();
  $('#worldView').classList.toggle('hidden', !map);
  $('#rankingView').classList.toggle('hidden', view !== 'ranking');
  $('#historyView').classList.toggle('hidden', view !== 'history');

  $$('.side-action').forEach(button => button.classList.toggle('active', button.dataset.view === view));

  if (map) {
    $('#stageTitle').textContent = 'Bosque das Descobertas';
    $('#stageSubtitle').textContent = 'Explore, encontre um spot e coloque seu conhecimento à prova.';
  } else if (view === 'ranking') {
    $('#stageTitle').textContent = 'Ranking global';
    $('#stageSubtitle').textContent = 'Acompanhe a evolução dos aventureiros.';
    loadRanking();
  } else {
    $('#stageTitle').textContent = 'Meu histórico';
    $('#stageSubtitle').textContent = 'Suas tentativas e atividades concluídas.';
    loadHistory();
  }
}

function distance(a, b) { return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y)); }

function allTargets() {
  return [
    ...state.spots.map(item => ({ kind: 'spot', item })),
    ...state.npcs.map(item => ({ kind: 'npc', item })),
  ];
}

function getNearestTarget() {
  let nearest = null;
  let shortest = Infinity;
  allTargets().forEach(target => {
    const d = distance(state.player, target.item);
    if (d < shortest) { shortest = d; nearest = { ...target, distance: d }; }
  });
  return nearest && nearest.distance <= 108 ? nearest : null;
}

function updateNearby() {
  const nearest = getNearestTarget();
  state.nearest = nearest;

  $$('.map-object').forEach(marker => {
    marker.classList.toggle('nearest', Boolean(nearest && marker.dataset.kind === nearest.kind && Number(marker.dataset.id) === Number(nearest.item.id)));
  });

  const button = $('#interactButton');
  if (!nearest) {
    $('#nearbyTitle').textContent = 'Explore o mapa';
    $('#nearbyText').textContent = 'Aproxime-se de um ponto de atividade ou NPC.';
    button.disabled = true;
    button.innerHTML = 'Interagir <kbd>E</kbd>';
  } else if (nearest.kind === 'npc') {
    $('#nearbyTitle').textContent = nearest.item.name;
    $('#nearbyText').textContent = 'Um habitante do mundo está por perto. Converse para receber uma dica.';
    button.disabled = false;
    button.innerHTML = 'Conversar <kbd>E</kbd>';
  } else {
    $('#nearbyTitle').textContent = nearest.item.name;
    $('#nearbyText').textContent = nearest.item.available
      ? `${nearest.item.category} · ${rarityNames[nearest.item.rarity] || 'Comum'} · +${nearest.item.reward_x
        } XP base` : 'Este ponto está regenerando. Explore outro local.';
      button.disabled = !nearest.item.available;
      button.innerHTML = nearest.item.available ? 'Iniciar atividade <kbd>E</kbd>' : 'Em regeneração';
    }
  }

  function placePlayer(x, y, center = false) {
    const maxX = state.mapSize.width - 32;
    const maxY = state.mapSize.height - 40;
    state.player.x = Math.max(30, Math.min(maxX, x));
    state.player.y = Math.max(45, Math.min(maxY, y));
    const token = $('#playerToken');
    token.style.left = `${state.player.x}px`;
    token.style.top = `${state.player.y}px`;
    if (center) centerCamera();
    updateNearby();
  }

  function centerCamera() {
    const viewport = $('#worldViewport');
    const left = state.player.x - viewport.clientWidth / 2;
    const top = state.player.y - viewport.clientHeight / 2;
    viewport.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: 'instant' });
  }

  function focusTarget(target) {
    if (!target) return;
    const d = distance(state.player, target.item);
    if (d <= 108) {
      state.nearest = { ...target, distance: d };
      interactWithNearest();
      return;
    }
    state.autoTarget = target;
    toast(`Indo em direção a ${target.item.name}.`, 'info');
    startMovement();
  }

  function startMovement() {
    if (state.animationFrame) return;
    state.animationFrame = requestAnimationFrame(movementLoop);
  }
  function stopMovement() {
    if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
    state.lastFrame = 0;
    state.keys.clear();
  }
  function movementLoop(timestamp) {
    if (!state.token || $('#worldView').classList.contains('hidden') || !$('#activityModal').classList.contains('hidden') || !$('#dialogModal').classList.contains('hidden') || !$('#helpModal').classList.contains('hidden')) {
      state.animationFrame = requestAnimationFrame(movementLoop);
      return;
    }
    const delta = state.lastFrame ? Math.min((timestamp - state.lastFrame) / 1000, .05) : 0;
    state.lastFrame = timestamp;
    let dx = 0, dy = 0;
    if (state.keys.has('ArrowLeft') || state.keys.has('a')) dx--;
    if (state.keys.has('ArrowRight') || state.keys.has('d')) dx++;
    if (state.keys.has('ArrowUp') || state.keys.has('w')) dy--;
    if (state.keys.has('ArrowDown') || state.keys.has('s')) dy++;
    if (dx || dy) {
      state.autoTarget = null;
    } else if (state.autoTarget) {
      const targetX = Number(state.autoTarget.item.x);
      const targetY = Number(state.autoTarget.item.y);
      const targetDistance = Math.hypot(targetX - state.player.x, targetY - state.player.y);
      if (targetDistance <= 78) {
        state.autoTarget = null;
      } else {
        dx = (targetX - state.player.x) / targetDistance;
        dy = (targetY - state.player.y) / targetDistance;
      }
    }
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      placePlayer(state.player.x + (dx / len) * state.player.speed * delta, state.player.y + (dy / len) * state.player.speed * delta);
      const viewport = $('#worldViewport');
      const margin = 105;
      const px = state.player.x;
      const py = state.player.y;
      const targetLeft = px < viewport.scrollLeft + margin ? Math.max(0, px - margin) : px > viewport.scrollLeft + viewport.clientWidth - margin ? Math.min(2000 - viewport.clientWidth, px - viewport.clientWidth + margin) : viewport.scrollLeft;
      const targetTop = py < viewport.scrollTop + margin ? Math.max(0, py - margin) : py > viewport.scrollTop + viewport.clientHeight - margin ? Math.min(1200 - viewport.clientHeight, py - viewport.clientHeight + margin) : viewport.scrollTop;
      viewport.scrollTo({ left: targetLeft, top: targetTop, behavior: 'instant' });
    }
    state.animationFrame = requestAnimationFrame(movementLoop);
  }

  function interactWithNearest() {
    const target = state.nearest || getNearestTarget();
    if (!target) return;
    if (target.kind === 'npc') return openNpcDialog(target.item);
    if (!target.item.available) return toast('Este spot ainda está em regeneração.', 'error');
    openSpotActivity(target.item);
  }

  function openNpcDialog(npc) {
    const lines = Array.isArray(npc.dialogue?.lines) ? npc.dialogue.lines : [];
    $('#dialogAvatar').textContent = npc.npc_type === 'teacher' ? '✎' : npc.npc_type === 'challenger' ? '⚔' : '✥';
    $('#dialogTitle').textContent = npc.name;
    $('#dialogText').textContent = lines.join(' ') || 'Bem-vindo ao Mundo do Conhecimento. Explore os spots e aprenda algo novo!';
    $('#dialogModal').classList.remove('hidden');
  }

  async function openSpotActivity(spot) {
    state.activeSpot = spot;
    state.selectedAnswer = null;
    state.isSubmitting = false;
    $('#activityResult').classList.add('hidden');
    $('#continueButton').classList.add('hidden');
    $('#answerForm').classList.remove('hidden');
    $('#submitAnswer').disabled = false;
    $('#submitAnswer').classList.remove('hidden');
    $('#submitAnswer').innerHTML = 'Confirmar resposta <b>→</b>';
    $('#activityQuestion').textContent = 'Preparando desafio...';
    $('#answerOptions').innerHTML = '';
    $('#openAnswerWrap').classList.add('hidden');
    $('#activityTitle').textContent = spot.name;
    $('#activityCategory').textContent = `${spot.category} · ${rarityNames[spot.rarity] || 'Comum'} · Recompensa base: ${spot.reward_xp} XP / ${spot.reward_coins} moedas`;
    $('#activityModal').classList.remove('hidden');
    try {
      let activities = await api(`/activities?category=${encodeURIComponent(spot.category)}`, { auth: false });
      if (!Array.isArray(activities) || !activities.length) {
        const generated = await api('/ai/generate-activity', { method: 'POST', body: JSON.stringify({ category: spot.category, difficulty: 'easy', format: 'multiple_choice' }) });
        activities = [generated];
      }
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const started = await api(`/activities/${activity.id}/start`, { method: 'POST' });
      state.activeActivity = started.activity || activity;
      state.attemptStartedAt = Date.now();
      renderActivity(state.activeActivity);
    } catch (error) {
      $('#activityModal').classList.add('hidden');
      toast(`Não foi possível iniciar a atividade: ${error.message}`, 'error');
    }
  }

  function renderActivity(activity) {
    const content = activity.content || {};
    $('#activityTitle').textContent = activity.title || 'Desafio de conhecimento';
    $('#activityCategory').textContent = `${activity.category || state.activeSpot.category} · ${String(activity.difficulty || 'easy').toUpperCase()}`;
    $('#activityDifficulty').textContent = String(activity.difficulty || 'FÁCIL').toUpperCase();
    $('#activityQuestion').textContent = content.question || activity.title || 'Responda ao desafio.';
    const options = Array.isArray(content.options) ? content.options : [];
    if (options.length) {
      $('#answerOptions').innerHTML = options.map((option, index) => `<button class="answer-option" type="button" data-answer="${escapeHTML(option)}"><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHTML(option)}</span></button>`).join('');
      $$('.answer-option').forEach(button => button.addEventListener('click', () => {
        state.selectedAnswer = button.dataset.answer;
        $$('.answer-option').forEach(option => option.classList.toggle('selected', option === button));
      }));
    } else {
      $('#openAnswerWrap').classList.remove('hidden');
      $('#answerOptions').innerHTML = '';
    }
  }

  async function submitAnswer(event) {
    event.preventDefault();
    if (state.isSubmitting || !state.activeActivity || !state.activeSpot) return;
    const answer = state.selectedAnswer ?? $('#openAnswer').value.trim();
    if (!String(answer ?? '').trim()) return toast('Selecione ou digite uma resposta.', 'error');
    state.isSubmitting = true;
    $('#submitAnswer').disabled = true;
    $('#submitAnswer').textContent = 'Validando resposta...';
    try {
      const result = await api(`/activities/${state.activeActivity.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          activity_id: state.activeActivity.id,
          answer: String(answer),
          spot_id: state.activeSpot.id,
          time_taken_seconds: Math.max(0, Math.round((Date.now() - state.attemptStartedAt) / 1000)),
        }),
      });
      const correct = Boolean(result.is_correct);
      const xp = Number(result.xp_earned || 0);
      const coins = Number(result.coins_earned || 0);
      const resultEl = $('#activityResult');
      resultEl.className = `activity-result ${correct ? 'success' : 'error'}`;
      resultEl.innerHTML = correct
        ? `<strong>✦ Resposta correta!</strong>Você recebeu <b>${xp} XP</b> e <b>${coins} moedas</b>.${result.leveled_up ? '<br><b>Você subiu de nível!</b>' : ''}${result.explanation ? `<br><br>${escapeHTML(result.explanation)}` : ''}`
        : `<strong>Quase lá!</strong>Essa não é a resposta correta. ${result.explanation ? escapeHTML(result.explanation) : 'Revise o conteúdo e tente outro desafio.'}`;
      resultEl.classList.remove('hidden');
      $('#answerForm').classList.add('hidden');
      $('#continueButton').classList.remove('hidden');
      if (correct) {
        toast(xp || coins ? `+${xp} XP · +${coins} moedas` : 'Resposta correta!', 'success');
        await refreshGameData();
      }
    } catch (error) {
      toast(`Não foi possível validar a resposta: ${error.message}`, 'error');
      $('#submitAnswer').disabled = false;
      $('#submitAnswer').innerHTML = 'Tentar novamente <b>→</b>';
    } finally {
      state.isSubmitting = false;
    }
  }

  async function refreshGameData() {
    const [character, progress, spots] = await Promise.all([
      api('/characters/me'), api('/progress/me'), api('/world/spots', { auth: false }),
    ]);
    state.character = character;
    state.progress = progress;
    state.spots = Array.isArray(spots) ? spots : state.spots;
    const updatedSpot = state.spots.find(spot => Number(spot.id) === Number(state.activeSpot?.id));
    if (updatedSpot) state.activeSpot = updatedSpot;
    renderProgress();
    renderWorldObjects();
    renderQuestPanel();
    updateNearby();
  }

  async function loadRanking() {
    $('#rankingList').innerHTML = '<div class="loading-line">Carregando classificação...</div>';
    try {
      const data = await api('/ranking/global?limit=20', { auth: false });
      const rankingData = Array.isArray(data) ? data : [];
      if (rankingData.length === 0) {
        $('#rankingList').innerHTML = '<div class="loading-line">Ainda não há aventureiros no ranking. Seja o primeiro!</div>';
        return;
      }
      $('#rankingList').innerHTML = rankingData.map(entry => `<div class="ranking-row"><span class="rank-position">${String(entry.position).padStart(2, '0')}</span><span class="rank-person"><strong>${escapeHTML(entry.name || entry.nick)}</strong><small>@${escapeHTML(entry.nick)} · ${Number(entry.activities_completed || 0)} atividades</small></span><span class="rank-level">Nv. ${Number(entry.level || 1)}</span><span class="rank-xp"><strong>${Number(entry.xp || 0).toLocaleString('pt-BR')}</strong> XP</span></div>`).join('');
    } catch (error) {
      $('#rankingList').innerHTML = `<div class="loading-line">Não foi possível carregar o ranking: ${escapeHTML(error.message)}</div>`;
    }
  }

  async function loadHistory() {
    $('#historyList').innerHTML = '<div class="loading-line">Carregando histórico...</div>';
    try {
      const [historyRaw, activitiesRaw] = await Promise.all([
        api('/activities/history'),
        api('/activities', { auth: false })
      ]);
      const historyData = Array.isArray(historyRaw) ? historyRaw : [];
      const activitiesData = Array.isArray(activitiesRaw) ? activitiesRaw : [];
      const byId = new Map(activitiesData.map(activity => [activity.id, activity]));
      if (historyData.length === 0) {
        $('#historyList').innerHTML = '<div class="loading-line">Você ainda não concluiu atividades. Explore o mapa para começar!</div>';
        return;
      }
      $('#historyList').innerHTML = historyData.slice(0, 30).map(entry => {
        const activity = byId.get(entry.activity_id);
        const date = entry.completed_at ? new Date(entry.completed_at).toLocaleString('pt-BR') : 'Data indisponível';
        return `<div class="history-row"><span class="history-result ${entry.is_correct ? '' : 'fail'}">${entry.is_correct ? '✓' : '×'}</span><span><strong>${escapeHTML(activity?.title || `Atividade #${entry.activity_id}`)}</strong><small>${escapeHTML(activity?.category || 'Conhecimento')} · ${escapeHTML(date)}</small></span><span class="history-xp">+${Number(entry.xp_earned || 0)} XP</span></div>`;
      }).join('');
    } catch (error) {
      $('#historyList').innerHTML = `<div class="loading-line">Não foi possível carregar o histórico: ${escapeHTML(error.message)}</div>`;
    }
  }

  async function refreshWorld() {
    try {
      const [spots, npcs] = await Promise.all([api('/world/spots', { auth: false }), api('/npcs', { auth: false })]);
      state.spots = Array.isArray(spots) ? spots : [];
      state.npcs = Array.isArray(npcs) ? npcs : [];
      renderWorldObjects();
      renderQuestPanel();
      updateNearby();
      toast('Mapa atualizado com os dados do servidor.', 'success');
    } catch (error) {
      toast(`Não foi possível atualizar o mundo: ${error.message}`, 'error');
    }
  }

  function closeModals() {
    $$('.modal-backdrop').forEach(modal => modal.classList.add('hidden'));
  }

  function logout() {
    clearTokens();
    closeModals();
    showAuth('login');
    setConnection('online', 'API disponível');
    toast('Você saiu do mundo.', 'info');
  }

  function bindEvents() {
    $$('.auth-tab').forEach(button => button.addEventListener('click', () => selectAuthTab(button.dataset.authTab)));
    $('#loginForm').addEventListener('submit', handleLogin);
    $('#registerForm').addEventListener('submit', handleRegister);
    $('#answerForm').addEventListener('submit', submitAnswer);
    $('#continueButton').addEventListener('click', () => {
      closeModals();
      state.activeActivity = null;
      state.activeSpot = null;
      $('#worldViewport').focus({ preventScroll: true });
    });
    $('#interactButton').addEventListener('click', interactWithNearest);
    $('#logoutButton').addEventListener('click', logout);
    $('#refreshWorld').addEventListener('click', refreshWorld);
    $('#helpButton').addEventListener('click', () => $('#helpModal').classList.remove('hidden'));
    $('#focusNearest').addEventListener('click', () => {
      const target = allTargets().sort((a, b) => distance(state.player, a.item) - distance(state.player,
        b.item))[0];
      if (target) focusTarget(target);
    });
    $$('.side-action').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
    $$('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
    $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModals(); }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModals();
      const key = event.key ? (event.key.length === 1 ? event.key.toLowerCase() : event.key) : '';
      if (key && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key) && !isTyping(event.target)) {
        event.preventDefault();
        state.keys.add(key);
        startMovement();
      }
      if ((key === 'e' || key === ' ') && !isTyping(event.target) && $('#gameScreen').classList.contains('hidden') === false && !$('#worldView').classList.contains('hidden') && $('#activityModal').classList.contains('hidden') && $('#dialogModal').classList.contains('hidden') && $('#helpModal').classList.contains('hidden')) {
        event.preventDefault();
        interactWithNearest();
      }
    });
    document.addEventListener('keyup', event => {
      const key = event.key ? (event.key.length === 1 ? event.key.toLowerCase() : event.key) : '';
      state.keys.delete(key);
    });
    window.addEventListener('blur', () => state.keys.clear());
    $$('.mobile-controls button').forEach(button => {
      const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
      const key = keyMap[button.dataset.move];
      const start = event => { event.preventDefault(); state.keys.add(key); startMovement(); };
      const end = event => { event.preventDefault(); state.keys.delete(key); };
      button.addEventListener('pointerdown', start);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => button.addEventListener(type, end));
    });
  }

  function isTyping(target) {
    return target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
  }

  async function init() {
    $('#currentYear').textContent = new Date().getFullYear();
    bindEvents();
    setConnection('offline', 'API não verificada');
    try {
      const response = await fetch(`${API_URL.replace(/\/testeme$/, '')}/`, { method: 'GET' });
      if (response.ok) setConnection('online', 'API disponível');
      else setConnection('offline', 'API indisponível');
    } catch {
      setConnection('offline', 'API indisponível');
    }
    const requestedView = new URLSearchParams(window.location.search).get('view');
    if (!state.token) {
      showAuth(requestedView === 'register' ? 'register' : 'login');
      return;
    }
    try {
      await enterWorld();
      if (requestedView === 'ranking' || requestedView === 'history') setView(requestedView);
    } catch {
      // enterWorld já retorna para a tela de autenticação
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
