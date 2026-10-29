'use strict';
(() => {
  const config = window.BRASIL_BOOT;
  const overlay = document.getElementById('status');
  const progress = document.getElementById('status-progress');
  const detail = document.getElementById('startup-detail');
  const amount = document.getElementById('startup-amount');
  const retry = document.getElementById('startup-retry');
  const MB = 1024 * 1024;
  let active = true;
  let lastActivity = Date.now();
  let packLoaded = 0;
  let packTotal = config.fileSizes['index.pck'];
  const engine = typeof Engine === 'function' ? new Engine(config) : null;
  const update = (message, loaded, total) => {
    if (!active) return;
    detail.textContent = message;
    lastActivity = Date.now();
    if (total > 0) {
      progress.max = total;
      progress.value = Math.min(loaded, total);
      amount.textContent = Math.floor(loaded / total * 100) + '% · ' + (loaded / MB).toFixed(1) + ' / ' + (total / MB).toFixed(1) + ' MB';
    }
  };
  function fail(error) {
    if (!active) return;
    clearInterval(watch);
    detail.textContent = 'O carregamento não terminou. Você pode tentar novamente.';
    amount.textContent = error?.message || 'Verifique a conexão e tente de novo.';
    retry.hidden = false;
    retry.focus();
    console.error('Brasil em Apuros: carregamento', error);
  }
  retry.addEventListener('click', () => location.reload());
  navigator.serviceWorker?.addEventListener('message', event => {
    const data = event.data;
    if (!active || data?.version !== config.packVersion) return;
    if (data.type === 'brasil:pack-progress') {
      packLoaded = data.loaded;
      packTotal = data.total;
      update('Baixando a aventura · parte ' + data.part + ' de ' + data.parts, data.loaded, data.total);
      if (data.loaded === data.total) update('Preparando personagens e cenário…', data.loaded, data.total);
    } else if (data.type === 'brasil:pack-retry') {
      update('Reconectando a parte ' + data.part + ' · tentativa ' + data.attempt + ' de 3', data.loaded, data.total);
    } else if (data.type === 'brasil:pack-error') fail(new Error(data.message));
  });
  const watch = setInterval(() => {
    if (active && Date.now() - lastActivity > 90000) {
      clearInterval(watch);
      fail(new Error('Sem progresso há 90 segundos. Seus dados salvos serão mantidos.'));
    }
  }, 1000);
  async function prepare() {
    if (!engine) throw new Error('Não foi possível carregar o motor. Verifique a conexão e tente novamente.');
    if (!('serviceWorker' in navigator)) throw new Error('Abra em um navegador atualizado, como Chrome, Edge ou Safari.');
    update('Preparando o carregamento…', 0, config.fileSizes['index.pck'] + config.fileSizes['index.wasm']);
    const expected = config.workerVersion;
    const ready = () => new URL(navigator.serviceWorker.controller?.scriptURL || 'about:blank').searchParams.get('v') === expected;
    const registration = await navigator.serviceWorker.register('./pack-sw.js?v=' + expected, {scope:'./', updateViaCache:'none'});
    if (registration.waiting) registration.waiting.postMessage({type:'ACTIVATE'});
    if (!ready()) await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', check); reject(new Error('Não foi possível atualizar o carregador. Tente novamente.')); }, 25000);
      function check() { if (ready()) { clearTimeout(timer); navigator.serviceWorker.removeEventListener('controllerchange', check); resolve(); } }
      navigator.serviceWorker.addEventListener('controllerchange', check);
      check();
    });
    const missing = Engine.getMissingFeatures({threads:false});
    if (missing.length) throw new Error('Este navegador não tem os recursos necessários para o jogo: ' + missing.join(', '));
    update('Carregando o motor do jogo…', 0, config.fileSizes['index.wasm']);
    await engine.startGame({onProgress(current, total) {
      lastActivity = Date.now();
      if (packLoaded > 0 && packLoaded < packTotal) return;
      if (packLoaded === packTotal) update('Preparando personagens e cenário…', current, total);
      else update('Carregando o motor do jogo…', current, total);
    }});
    active = false;
    clearInterval(watch);
    overlay.remove();
    window.dispatchEvent(new Event('brasil:godot-ready'));
  }
  prepare().catch(fail);
})();
