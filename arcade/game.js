(() => {
  'use strict';

  const WIDTH = 390, HEIGHT = 740;
  const CHARACTERS = {
    lula: { name: 'LULA', team: '13', idle: './assets/lula_idle.png', run: './assets/lula_run.png', iw: 96, ih: 128, rw: 128, rh: 256 },
    alckmin: { name: 'ALCKMIN', team: '13', idle: './assets/alckmin_idle.png', run: './assets/alckmin_run.png', iw: 128, ih: 256, rw: 128, rh: 256 },
    flavio: { name: 'FLÁVIO', team: '22', idle: './assets/flavio_idle.png', run: './assets/flavio_run.png', iw: 96, ih: 128, rw: 96, rh: 128 },
    eduardo: { name: 'EDUARDO', team: '22', idle: './assets/eduardo_idle.png', run: './assets/eduardo_run.png', iw: 96, ih: 128, rw: 96, rh: 128 }
  };
  const TEAMS = { '13': ['lula', 'alckmin'], '22': ['flavio', 'eduardo'] };
  const SPECIALS = {
    lula: { title: 'PALANQUE MAGNÉTICO', desc: 'Atrai maletas próximas por 6 segundos', color: '#ffce6a' },
    alckmin: { title: 'PLANO B', desc: 'Garante um escudo protetor imediato', color: '#8cf1cc' },
    flavio: { title: 'CORRERIA TURBO', desc: 'Fica protegido por 4 segundos', color: '#77d8ff' },
    eduardo: { title: 'PASSAPORTE VIP', desc: 'Remove a papelada da tela e desacelera o perigo', color: '#d1a4ff' }
  };
  const ACTS = ['ATO I • PRIMEIROS CARIMBOS', 'ATO II • PILHAS DE PAPEL', 'ATO III • PRAZO FINAL'];
  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const device = $('app');
  const menu = $('menu');
  const gameScreen = $('gameScreen');
  const pauseOverlay = $('pauseOverlay');
  const resultOverlay = $('resultOverlay');
  const howOverlay = $('howOverlay');
  const feedbackEl = $('feedback');

  let team = '13', hero = 'lula', duration = 45, audioEnabled = true;
  let phase = 'menu', game = null, frameId = null, lastTick = 0;
  let touchHeld = false, leftHeld = false, rightHeld = false, keyboard = { left: false, right: false };
  let audioContext = null;
  const pictures = new Map();
  const cityImages = {};
  const maleta = loadImage('./assets/maleta.png');
  cityImages['13'] = loadImage('../media/hero13.jpg');
  cityImages['22'] = loadImage('../media/hero22.jpg');

  function loadImage(src) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    return img;
  }
  function fetchSprites() {
    for (const [id, char] of Object.entries(CHARACTERS)) {
      pictures.set(`${id}:idle`, loadImage(char.idle));
      pictures.set(`${id}:run`, loadImage(char.run));
    }
  }
  fetchSprites();
  function imageReady(img) { return !!(img && img.complete && img.naturalWidth > 0); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function random(a, b) { return a + Math.random() * (b - a); }
  function roundedRect(x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function save(key, value) { try { localStorage.setItem(key, String(value)); } catch (_) { /* private browsing */ } }
  function read(key, fallback = 0) { try { return Number(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function recordKey() { return `br-arcade-best:${hero}:${duration}`; }
  function syncSetup() {
    device.classList.toggle('team22', team === '22');
    document.querySelectorAll('[data-team]').forEach(btn => {
      const selected = btn.dataset.team === team;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-seconds]').forEach(btn => {
      const selected = Number(btn.dataset.seconds) === duration;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    $('abilityHint').textContent = '✦ ' + SPECIALS[hero].title + ' — ' + SPECIALS[hero].desc;
    const roster = $('roster');
    roster.replaceChildren();
    for (const id of TEAMS[team]) {
      const info = CHARACTERS[id];
      const selected = id === hero;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `fighter${selected ? ' selected' : ''}`;
      btn.setAttribute('aria-pressed', String(selected));
      btn.setAttribute('aria-label', `Jogar com ${info.name}`);
      let face;
      if (id === 'alckmin') {
        face = document.createElement('div');
        face.className = 'sprite-preview';
        face.style.backgroundImage = `url('${info.idle}')`;
      } else {
        face = document.createElement('img');
        face.src = info.idle;
        face.alt = '';
        face.loading = 'eager';
      }
      const art = document.createElement('div');
      art.className = 'fighter-picture';
      art.append(face);
      btn.append(art);
      const name = document.createElement('div');
      name.className = 'fighter-name';
      name.textContent = info.name;
      btn.append(name);
      if (selected) {
        const mark = document.createElement('span');
        mark.className = 'selected-mark'; mark.textContent = 'SELECIONADO';
        btn.append(mark);
      }
      btn.addEventListener('click', () => { hero = id; syncSetup(); tone('tap'); });
      roster.append(btn);
    }
  }

  function show(screen) {
    menu.classList.toggle('hidden', screen !== 'menu');
    gameScreen.classList.toggle('hidden', screen !== 'game');
    if (screen !== 'result') resultOverlay.classList.add('hidden');
    if (screen !== 'how') howOverlay.classList.add('hidden');
    if (screen !== 'game') pauseOverlay.classList.add('hidden');
  }
  function setSound() {
    audioEnabled = !audioEnabled;
    $('soundButton').textContent = audioEnabled ? '♫ SOM: ON' : '♫ SOM: OFF';
    $('soundButton').setAttribute('aria-pressed', String(audioEnabled));
    save('br-arcade-sound', audioEnabled ? 1 : 2);
  }
  function tone(kind) {
    if (!audioEnabled) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      if (!audioContext) audioContext = new C();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      const now = audioContext.currentTime;
      const freq = { coin: 880, hit: 180, shield: 660, life: 740, win: 950, tap: 430 }[kind] || 430;
      osc.type = kind === 'hit' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (kind === 'coin' || kind === 'win') osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + .08);
      else if (kind === 'hit') osc.frequency.exponentialRampToValueAtTime(95, now + .12);
      gain.gain.setValueAtTime(.025, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .13);
      osc.connect(gain).connect(audioContext.destination); osc.start(now); osc.stop(now + .14);
    } catch (_) { /* audio is optional */ }
  }
  function newGame() {
    cancelAnimationFrame(frameId);
    touchHeld = leftHeld = rightHeld = false;
    keyboard.left = keyboard.right = false;
    game = {
      time: 0, score: 0, lives: 3, combo: 0, maxCombo: 0, cases: 0, hits: 0,
      specialCharge: 0, specialTimer: 0, specialCount: 0, act: 0,
      playerX: WIDTH / 2, targetX: WIDTH / 2, drops: [], particles: [], floaters: [],
      shield: false, hurtFor: 0, emit: 0, nextId: 0, effectMessage: '', effectFor: 0,
      shake: 0, theme: team, character: hero, goal: duration, finished: false
    };
    phase = 'play'; show('game'); pauseOverlay.classList.add('hidden'); updateHud(); lastTick = performance.now();
    tone('tap'); frameId = requestAnimationFrame(tick);
  }
  function pause() {
    if (phase !== 'play') return;
    phase = 'pause'; cancelAnimationFrame(frameId);
    pauseOverlay.classList.remove('hidden');
  }
  function resume() {
    if (phase !== 'pause') return;
    phase = 'play'; pauseOverlay.classList.add('hidden');
    lastTick = performance.now(); frameId = requestAnimationFrame(tick); tone('tap');
  }
  function toMenu() {
    cancelAnimationFrame(frameId);
    phase = 'menu'; game = null; show('menu'); syncSetup();
  }
  function activateSpecial() {
    if (phase !== 'play' || !game || game.specialCharge < 100) return;
    const g = game;
    g.specialCharge = 0;
    g.specialCount++;
    const power = SPECIALS[g.character];
    g.specialTimer = g.character === 'flavio' ? 4 : 6;
    if (g.character === 'alckmin') {
      g.shield = true;
    } else if (g.character === 'flavio') {
      g.hurtFor = Math.max(g.hurtFor, 4);
    } else if (g.character === 'eduardo') {
      const papers = g.drops.filter(item => item.kind === 'paper');
      for (const item of papers) addParticles(item.x, item.y, '#d1a4ff', 4);
      g.drops = g.drops.filter(item => item.kind !== 'paper');
    }
    flash('✦ ' + power.title + '!', power.color);
    tone('shield');
    updateHud();
  }

  function spawn() {
    const roll = Math.random();
    let kind = roll < .053 ? 'dog' : roll < .083 ? 'coffee' : roll < .59 ? 'case' : 'paper';
    if (game.time < 4 && kind === 'paper') kind = 'case';
    game.drops.push({ id: game.nextId++, x: random(32, WIDTH - 32), y: -45,
      kind, speed: random(130, 165) + game.time * (game.goal === 45 ? 1.4 : 1.65),
      rot: random(-.2, .2), size: kind === 'paper' ? 31 : 27 });
  }
  function addParticles(x, y, color, qty = 7) {
    for (let i = 0; i < qty; i++) game.particles.push({ x, y, vx: random(-110, 110), vy: random(-130, 60), t: .5, max: .5, color });
  }
  function flash(message, color = '#ffdc73') {
    game.effectMessage = message; game.effectFor = .8;
    feedbackEl.textContent = message; feedbackEl.style.color = color;
  }
  function collect(drop) {
    const g = game;
    if (drop.kind === 'case') {
      g.combo++; g.maxCombo = Math.max(g.maxCombo, g.combo); g.cases++;
      const earned = 10 + Math.min(10, g.combo - 1) * 3;
      g.score += earned;
      const previouslyReady = g.specialCharge === 100;
      g.specialCharge = Math.min(100, g.specialCharge + 20);
      if (g.specialCharge === 100 && !previouslyReady)
        flash('✦ PODER ESPECIAL PRONTO!', SPECIALS[g.character].color);
      else flash(`+${earned} MALETA!`);
      addParticles(drop.x, drop.y, '#ffce6a', 9); tone('coin');
    } else if (drop.kind === 'paper') {
      if (g.shield) {
        g.shield = false; flash('CARAMELO SALVOU!', '#70ffe7');
        addParticles(drop.x, drop.y, '#48e2c0', 13); tone('shield');
      } else if (g.hurtFor <= 0) {
        g.lives--; g.hits++; g.combo = 0; g.hurtFor = 1.1; g.shake = .23;
        flash('AI, A PAPELADA!', '#ff8189'); addParticles(drop.x, drop.y, '#ff8189'); tone('hit');
      }
    } else if (drop.kind === 'dog') {
      g.shield = true; flash('ESCUDO CARAMELO!', '#75f5cf');
      addParticles(drop.x, drop.y, '#75f5cf', 9); tone('shield');
    } else {
      g.lives = Math.min(3, g.lives + 1); g.score += 5;
      flash('CAFÉ +1 VIDA!', '#75f5cf'); addParticles(drop.x, drop.y, '#75f5cf'); tone('life');
    }
  }
  function update(dt) {
    const g = game;
    g.time = Math.min(g.goal, g.time + dt);
    g.specialTimer = Math.max(0, g.specialTimer - dt);
    const nextAct = Math.min(2, Math.floor(g.time / (g.goal / 3)));
    if (nextAct > g.act) {
      g.act = nextAct;
      flash(ACTS[nextAct], '#ffe2a3');
      tone('shield');
    }
    g.playerX += (g.targetX - g.playerX) * Math.min(1, dt * 14);
    const speed = 250;
    if (leftHeld || keyboard.left) g.targetX -= speed * dt;
    if (rightHeld || keyboard.right) g.targetX += speed * dt;
    g.targetX = clamp(g.targetX, 34, WIDTH - 34);
    g.hurtFor = Math.max(0, g.hurtFor - dt); g.shake = Math.max(0, g.shake - dt);
    g.effectFor = Math.max(0, g.effectFor - dt);
    if (g.effectFor <= 0) feedbackEl.textContent = '';
    const interval = Math.max(g.goal === 45 ? .42 : .34,
      .9 - g.time * (g.goal === 45 ? .011 : .007) - g.act * .045);
    g.emit += dt;
    if (g.emit >= interval) { g.emit -= interval; spawn(); }
    const remaining = [];
    for (const item of g.drops) {
      const oldY = item.y;
      const slowedPaper = g.character === 'eduardo' && g.specialTimer > 0 && item.kind === 'paper';
      item.y += item.speed * dt * (slowedPaper ? .4 : 1);
      if (g.character === 'lula' && g.specialTimer > 0 && item.kind === 'case' &&
          item.y > HEIGHT * .43 && Math.abs(item.x - g.playerX) < 135) {
        item.x += (g.playerX - item.x) * Math.min(1, dt * 5);
      }
      if (oldY < HEIGHT * .79 && item.y >= HEIGHT * .79 && Math.abs(item.x - g.playerX) < 42) {
        collect(item); continue;
      }
      if (item.y < HEIGHT + 45) remaining.push(item);
    }
    g.drops = remaining;
    g.particles = g.particles.filter(p => p.t > 0);
    for (const p of g.particles) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 210 * dt; }
    if (g.lives <= 0) { finish(false); return; }
    if (g.time >= g.goal) { finish(true); return; }
  }
  function drawImageCover(img, x, y, w, h) {
    if (!imageReady(img)) return;
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }
  function drawBackground() {
    const is13 = game.theme === '13';
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, game.act === 2 ? '#34233d' : '#19314f');
    bg.addColorStop(.56, is13 ? '#24182b' : '#092f36'); bg.addColorStop(1, '#06121c');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save(); ctx.globalAlpha = .16;
    drawImageCover(cityImages[game.theme], 0, 0, WIDTH, HEIGHT); ctx.restore();
    for (let i = 0; i < 17; i++) {
      const w = WIDTH / 15, x = i * 27 - 14, ht = 65 + ((i * 43) % 123);
      ctx.fillStyle = i % 2 ? '#172b39' : '#203344'; ctx.fillRect(x, HEIGHT - ht, w, ht);
      ctx.fillStyle = '#e6b86045';
      for (let row = 0; row < 4; row++) {
        const yy = HEIGHT - ht + 15 + row * 23;
        if (yy < HEIGHT - 8) ctx.fillRect(x + 6, yy, 5, 6);
      }
    }
    ctx.fillStyle = '#06132099'; ctx.fillRect(0, HEIGHT - 70, WIDTH, 70);
    ctx.strokeStyle = is13 ? '#ff7b8748' : '#45e1bd55'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, HEIGHT * .865); ctx.lineTo(WIDTH, HEIGHT * .865); ctx.stroke();
    ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1;
    for (let y = 120; y < HEIGHT; y += 42) { ctx.beginPath();ctx.moveTo(0, y);ctx.lineTo(WIDTH, y);ctx.stroke(); }
  }
  function drawSprite(img, config, x, y, w, h, run) {
    if (!imageReady(img)) return false;
    let fw = run ? config.rw : config.iw;
    let fh = run ? config.rh : config.ih;
    const frames = Math.max(1, Math.floor(img.naturalWidth / fw));
    if (img.naturalHeight < fh) { fw = img.naturalWidth; fh = img.naturalHeight; }
    const idx = run ? (Math.floor(game.time * 9) % frames) : 0;
    const sx = clamp(idx * fw, 0, img.naturalWidth - fw);
    ctx.drawImage(img, sx, 0, fw, fh, x - w / 2, y - h / 2, w, h);
    return true;
  }
  function drawCharacter() {
    const g = game;
    const x = g.playerX, y = HEIGHT * .79;
    if (g.hurtFor > 0 && Math.floor(g.hurtFor * 13) % 2 === 0) return;
    if (g.specialTimer > 0 && g.character !== 'alckmin') {
      ctx.strokeStyle = SPECIALS[g.character].color;
      ctx.lineWidth = 2.5; ctx.globalAlpha = .5 + .2 * Math.sin(g.time * 9);
      ctx.beginPath(); ctx.ellipse(x, y, 49, 73, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (g.shield) {
      ctx.strokeStyle = '#5cf2c5b8'; ctx.lineWidth = 4;
      ctx.beginPath();ctx.ellipse(x, y, 47, 76, 0, 0, Math.PI * 2);ctx.stroke();
      ctx.fillStyle = '#46ffbf14';ctx.fill();
    }
    const char = CHARACTERS[game.character];
    const run = pictures.get(`${game.character}:run`);
    const idle = pictures.get(`${game.character}:idle`);
    const dw = g.theme === '13' ? 76 : 82, dh = g.theme === '13' ? 124 : 119;
    if (!drawSprite(run, char, x, y, dw, dh, true) && !drawSprite(idle, char, x, y, dw, dh, false)) {
      ctx.fillStyle = '#f8d271';roundedRect(x - 32, y - 42, 64, 84, 16);ctx.fill();
      ctx.font = 'bold 18px sans-serif';ctx.textAlign='center';ctx.fillStyle='#152033';ctx.fillText(char.name.slice(0,3), x, y + 6);
    }
    ctx.fillStyle='#06101dbb';ctx.beginPath();ctx.ellipse(x,y+61,36,8,0,0,Math.PI*2);ctx.fill();
  }
  function drawSuitcase(item) {
    ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.rot);
    if (imageReady(maleta)) { ctx.drawImage(maleta, -26, -26, 52, 52); }
    else {
      ctx.fillStyle='#e4ac44';roundedRect(-20,-13,40,30,6);ctx.fill();
      ctx.strokeStyle='#ffdfa5';ctx.lineWidth=3;ctx.strokeRect(-8,-20,16,9);
      ctx.fillStyle='#9a591b';ctx.fillRect(-1,-13,2,30);
    }
    ctx.restore();
  }
  function drawPaper(item) {
    ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.rot);
    ctx.shadowBlur=14;ctx.shadowColor='#ff6876aa';
    ctx.fillStyle='#f6eadc';roundedRect(-22,-28,44,55,6);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#dc495b';roundedRect(-22,-28,44,14,5);ctx.fill();
    ctx.fillStyle='#fff0f2';ctx.font='900 8px sans-serif';ctx.textAlign='center';ctx.fillText('PRAZO!',0,-18);
    ctx.strokeStyle='#596174';ctx.lineWidth=2;
    for(let y=-6;y<17;y+=8){ctx.beginPath();ctx.moveTo(-13,y);ctx.lineTo(13,y);ctx.stroke();}
    ctx.restore();
  }
  function drawPower(item) {
    ctx.save();ctx.translate(item.x,item.y);
    const shield = item.kind === 'dog';
    ctx.fillStyle = shield ? '#11594b' : '#5e3c21';
    ctx.strokeStyle = shield ? '#79f4cb' : '#ffcc78';
    ctx.lineWidth = 3;ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.font = '28px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(shield?'🐕':'☕',0,1);ctx.restore();
  }
  function drawScene() {
    if (!game) return;
    const g = game;
    ctx.save();
    if (g.shake > 0) ctx.translate(random(-3,3),random(-3,3));
    drawBackground();
    for (const item of g.drops) {
      if (item.kind === 'case') drawSuitcase(item);
      else if (item.kind === 'paper') drawPaper(item);
      else drawPower(item);
    }
    drawCharacter();
    for (const p of g.particles) {
      ctx.globalAlpha = clamp(p.t / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,3.2*p.t/p.max+1,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function updateHud() {
    if (!game) return;
    const g = game;
    $('hudScore').textContent = g.score.toLocaleString('pt-BR');
    $('hudTime').textContent = `${Math.ceil(Math.max(0,g.goal-g.time))}s`;
    $('hudLives').textContent = '♥ '.repeat(Math.max(0, g.lives)).trim() || '—';
    $('timerFill').style.width = `${100*g.time/g.goal}%`;
    $('hudCombo').textContent = g.shield ? '🐕 ESCUDO CARAMELO ATIVO' :
      g.combo >= 3 ? `COMBO ×${g.combo} • SEGURA A MALETA!` : 'MALETA = PONTOS • PAPELADA = PERIGO';
    $('hudPhase').textContent = ACTS[g.act];
    const specialButton = $('specialButton');
    const ready = g.specialCharge >= 100;
    specialButton.disabled = !ready || phase !== 'play';
    specialButton.classList.toggle('ready', ready);
    specialButton.setAttribute('aria-label', ready ?
      `Ativar ${SPECIALS[g.character].title}` :
      `${SPECIALS[g.character].title}: ${g.specialCharge}% carregado`);
    $('specialCharge').textContent = ready ? 'PRONTO!' : `${g.specialCharge}%`;
  }
  function tick(now) {
    if (phase !== 'play') return;
    const dt = clamp((now - lastTick) / 1000, 0, .05);
    lastTick = now;
    update(dt);
    drawScene(); updateHud();
    if (phase === 'play') frameId = requestAnimationFrame(tick);
  }
  function finish(survived) {
    if (!game || game.finished) return;
    game.finished = true;
    phase = 'result'; cancelAnimationFrame(frameId);
    const oldBest = read(recordKey());
    const isRecord = game.score > oldBest;
    if (isRecord) save(recordKey(), game.score);
    $('resultTitle').textContent = survived ? 'RESISTIU À PAPELADA!' : 'A PAPELADA VENCEU!';
    $('resultTag').textContent = isRecord ? '✦ NOVO RECORDE PESSOAL ✦' : 'FIM DA CORRERIA';
    $('resultScore').textContent = game.score.toLocaleString('pt-BR');
    $('resultBest').textContent = Math.max(game.score,oldBest).toLocaleString('pt-BR');
    $('resultCases').textContent = String(game.cases);
    $('resultCombo').textContent = String(game.maxCombo);
    $('resultPowers').textContent = String(game.specialCount);
    $('resultCopy').textContent = `${CHARACTERS[game.character].name} · Edição ${game.theme} · ${duration}s. ${survived ? 'Missão cumprida!' : 'Quase deu!'}`;
    resultOverlay.classList.remove('hidden');
    if (survived) tone('win'); else tone('hit');
  }
  async function shareScore() {
    if (!game) return;
    const title = 'Brasil em Apuros! — Correria no Planalto';
    const text = `Fiz ${game.score} pontos com ${CHARACTERS[game.character].name} na edição ${game.theme} (${game.goal}s). Tenta superar! ${location.href}`;
    try {
      if (navigator.share) { await navigator.share({title,text});return; }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text);$('shareButton').textContent='LINK COPIADO!';return; }
      window.prompt('Copie seu resultado:',text);
    } catch (_) { /* cancelled sharing */ }
  }
  function pointerPosX(event) {
    const bounds = canvas.getBoundingClientRect();
    return clamp((event.clientX - bounds.left) * WIDTH / bounds.width, 34, WIDTH - 34);
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (phase !== 'play') return;
    touchHeld = true;game.targetX = pointerPosX(event);
    canvas.setPointerCapture?.(event.pointerId);event.preventDefault();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (phase === 'play' && touchHeld) { game.targetX = pointerPosX(event);event.preventDefault(); }
  });
  canvas.addEventListener('pointerup', () => { touchHeld = false; });
  canvas.addEventListener('pointercancel', () => { touchHeld = false; });
  for (const [id, key] of [['leftButton','left'],['rightButton','right']]) {
    const button = $(id);
    button.addEventListener('pointerdown', e => { e.preventDefault(); if (key==='left') leftHeld=true; else rightHeld=true; button.setPointerCapture?.(e.pointerId); });
    for (const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=> { if(key==='left') leftHeld=false; else rightHeld=false; });
  }
  window.addEventListener('blur', () => { leftHeld=rightHeld=false;keyboard.left=keyboard.right=false;touchHeld=false; });
  document.addEventListener('keydown', e => {
    if (phase !== 'play' && phase !== 'pause') return;
    if (['ArrowLeft','KeyA'].includes(e.code)) { keyboard.left=true; e.preventDefault(); }
    if (['ArrowRight','KeyD'].includes(e.code)) { keyboard.right=true; e.preventDefault(); }
    if ((e.code === 'Escape' || e.code === 'Space') && !e.repeat) { if(phase==='play')pause(); else resume(); e.preventDefault(); }
    if (e.code === 'Enter' && phase === 'play' && !e.repeat) { activateSpecial(); e.preventDefault(); }
  });
  document.addEventListener('keyup', e => {
    if (['ArrowLeft','KeyA'].includes(e.code)) keyboard.left=false;
    if (['ArrowRight','KeyD'].includes(e.code)) keyboard.right=false;
  });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden && phase==='play')pause(); });
  document.querySelectorAll('[data-team]').forEach(btn=>btn.addEventListener('click',()=> { team=btn.dataset.team;hero=TEAMS[team][0];syncSetup();tone('tap'); }));
  document.querySelectorAll('[data-seconds]').forEach(btn=>btn.addEventListener('click',()=>{duration=Number(btn.dataset.seconds);syncSetup();tone('tap');}));
  $('startButton').addEventListener('click',newGame);
  $('howButton').addEventListener('click',()=>{howOverlay.classList.remove('hidden');tone('tap');});
  $('gotItButton').addEventListener('click',()=>howOverlay.classList.add('hidden'));
  $('soundButton').addEventListener('click',setSound);
  $('pauseButton').addEventListener('click',pause);
  $('specialButton').addEventListener('click',activateSpecial);
  $('resumeButton').addEventListener('click',resume);
  $('restartButton').addEventListener('click',newGame);
  $('quitButton').addEventListener('click',toMenu);
  $('againButton').addEventListener('click',newGame);
  $('homeButton').addEventListener('click',toMenu);
  $('shareButton').addEventListener('click',shareScore);
  if (read('br-arcade-sound',1) === 2) setSound();
  syncSetup();
})();
