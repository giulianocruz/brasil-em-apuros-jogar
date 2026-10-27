# QA — Correria no Planalto v0.2 (27/10/2026)

## Automatizado em CI
- `node --check arcade/game.js` valida sintaxe do JavaScript principal.
- `node --check arcade/sw.js` valida sintaxe do Service Worker.
- `node --test arcade/tests/*.test.mjs` simula interface e lógica em Node usando VM, Canvas/DOM de teste e tempo acelerado.
- Verificados: personagens Lula, Alckmin, Flávio e Eduardo; descrições de habilidades; escolha de 13/22; partidas 45/90s; tutorial; botões; cinco maletas carregam especial; consumo do poder; registro de poderes na tela final; três atos; pausa, retomada, saída e reset.
- `arcade-qa.yml` roda automaticamente quando o diretório é alterado; os resultados públicos ficam no GitHub Actions.
- Recursos da edição 13/22 permanecem em pastas separadas do novo arcade.

## Ambientes não validados nesta entrega
- Inspeção visual de sprites reais, contraste, frame rate e gesto touch em aparelhos físicos.
- Fluxo de instalação PWA do Chrome/Safari e funcionamento offline completo (depende de cache do Service Worker).
- Disponibilidade do link público deve ser checada após conclusão do deploy GitHub Pages.
- Nenhum APK Android desta versão foi compilado.

## Foco para o teste manual
1. Abrir `/arcade/` e escolher cada personagem nas duas equipes.
2. Jogar 45 segundos e usar o poder após cinco maletas.
3. Testar pausa, saída e recorde; repetir com Maratona 90 segundos.
4. Validar botões e arrasto em Android (Chrome) e iOS (Safari).
5. No Android, adicionar à tela inicial e abrir novamente; verificar carregamento em modo avião após uma primeira visita online.
6. Confirmar que a seleção da campanha não envia dados nem registra votos.
