'use strict';
/* Guia de teclas do desktop, independente do pacote binário do Godot. */
(() => {
  const fineDesktop = window.matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
  if (!fineDesktop.matches) return;
  const edition = location.pathname.includes('/22/') ? '22' : '13';
  const key = 'brasil-em-apuros-desktop-tutorial-' + edition + '-v1';
  const getSeen = () => { try { return sessionStorage.getItem(key) === '1'; } catch (_) { return false; } };
  const markSeen = () => { try { sessionStorage.setItem(key, '1'); } catch (_) {} };
  const item = (keys, action) =>
    '<div class="desktop-controls-item"><div class="desktop-controls-key">' +
    keys.map(k => '<kbd>' + k + '</kbd>').join('') + '</div><strong>' + action + '</strong></div>';
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', `
      <button type="button" id="desktop-controls-trigger" aria-controls="desktop-controls-modal" aria-expanded="false">⌨ TECLAS <span aria-hidden="true">?</span></button>
      <div id="desktop-controls-strip" aria-hidden="true"><b>J / K</b> ATACAR <span>·</span> <b>L / Ctrl</b> ESQUIVAR <span>·</span> <b>Shift</b> CORRER <span>·</span> <b>?</b> VER TODAS</div>
      <div id="desktop-controls-modal" role="dialog" aria-modal="true" aria-labelledby="desktop-controls-title" hidden>
        <div class="desktop-controls-card">
          <div class="desktop-controls-eyebrow">BRASIL EM APUROS! ${edition} · GUIA DO TECLADO</div>
          <h2 id="desktop-controls-title">DOMINE SEUS COMANDOS</h2>
          <p class="desktop-controls-intro">No computador, controle o personagem pelas setas ou por WASD. Confira especialmente as teclas de ataque e esquiva antes da aventura.</p>
          <div class="desktop-controls-grid">
            ${item(['←', '→', 'A', 'D'], 'Mover')}
            ${item(['Espaço', '↑', 'W'], 'Pular')}
            ${item(['J', 'K'], 'ATACAR / DISPARAR')}
            ${item(['L', 'Ctrl'], 'ESQUIVAR')}
            ${item(['Shift'], 'Correr')}
            ${item(['Esc', 'P'], 'Pausar')}
          </div>
          <p class="desktop-controls-hint">💼 <strong>Habilidade e maletas:</strong> as maletas de ataque liberam disparos rápidos por tempo limitado. Continue usando <strong>J ou K</strong> para aproveitar o efeito. <strong>M</strong> liga ou desliga o som.</p>
          <button type="button" id="desktop-controls-dismiss">ENTENDI · COMEÇAR A JOGAR</button>
        </div>
      </div>`);
    const modal = document.getElementById('desktop-controls-modal');
    const trigger = document.getElementById('desktop-controls-trigger');
    const dismiss = document.getElementById('desktop-controls-dismiss');
    let lastFocus = null;
    function openHelp() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      dismiss.focus();
    }
    function closeHelp() {
      modal.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      markSeen();
      const canvas = document.getElementById('canvas');
      if (canvas) { canvas.tabIndex = 0; canvas.focus(); }
      else if (lastFocus?.focus) lastFocus.focus();
    }
    trigger.addEventListener('click', openHelp);
    dismiss.addEventListener('click', closeHelp);
    modal.addEventListener('click', e => { if (e.target === modal) closeHelp(); });
    document.addEventListener('keydown', e => {
      if (modal.hidden) return;
      if (e.key === 'Escape' || (e.key === 'Enter' && e.target === dismiss)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeHelp();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        dismiss.focus();
      }
    }, true);
    window.addEventListener('brasil:godot-ready', () => {
      if (!getSeen()) openHelp();
    }, {once:true});
  });
})();
