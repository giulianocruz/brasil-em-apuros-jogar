# QA — Correria no Planalto v0.1 (27/10/2026)

- `node --check arcade/game.js`: passou.
- Teste de interface automatizado com Chromium/Playwright injetando HTML, CSS e JS no documento: sem exceções de página; seleção Lula/Alckmin e Flávio/Eduardo, troca 13/22, 45/90 s, tutorial, iniciar, pausar, continuar, recomeçar e retornar ao menu passaram.
- Teste acelerado do loop em Chromium: derrota, pontuação, recorde, contagem de maletas/combos e jogar novamente passaram, sem exceções.
- O ambiente de QA bloqueou navegação HTTP/localhost, por isso os recursos de imagem externos não foram carregados no teste; a aplicação também desenha placeholders de fallback.
- **Pendências:** validar visual dos sprites reais, uso contínuo em celular físico e a disponibilidade pública do GitHub Pages após deploy. Sem AdMob ou rastreamento nesta versão web.
