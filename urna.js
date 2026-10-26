'use strict';

/**
 * A urna é apenas um seletor local de campanhas.
 * Não armazena, transmite, contabiliza ou registra escolhas.
 * Sem JavaScript, os links HTML dos cartões continuam funcionando.
 */
(() => {
  const DESTINOS = Object.freeze({ '13': './13/', '22': './22/' });
  const cartoes = Array.from(document.querySelectorAll('[data-edicao]'));
  const confirmar = document.getElementById('confirmar');
  const visor = document.getElementById('selecao');
  if (!confirmar || !visor || cartoes.length !== 2) return;

  let edicao = null;

  function escolher(numero) {
    if (!Object.prototype.hasOwnProperty.call(DESTINOS, numero)) return;

    edicao = numero;
    for (const cartao of cartoes) {
      const selecionado = cartao.dataset.edicao === numero;
      cartao.dataset.selected = String(selecionado);
      if (selecionado) cartao.setAttribute('aria-current', 'true');
      else cartao.removeAttribute('aria-current');
    }
    visor.textContent = 'Campanha ' + numero + ' selecionada. Confirme para começar sua aventura.';
    confirmar.disabled = false;
    confirmar.setAttribute('aria-label', 'Confirmar e abrir o jogo da edição ' + numero);
  }

  for (const cartao of cartoes) {
    cartao.addEventListener('click', (evento) => {
      // Preserva abrir em nova aba e atalhos nativos dos links.
      if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
      evento.preventDefault();
      escolher(cartao.dataset.edicao);
    });
  }

  confirmar.addEventListener('click', () => {
    if (!edicao) return;
    window.location.assign(DESTINOS[edicao]);
  });
})();
