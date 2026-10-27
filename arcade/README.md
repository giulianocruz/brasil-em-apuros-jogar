# Brasil em Apuros! — Correria no Planalto (mini arcade v0.2)

**Spin-off original de sátira claramente fictícia**, construído com HTML5 Canvas, CSS e JavaScript sem frameworks. Aproveita sprites de Lula, Alckmin, Flávio e Eduardo dos projetos Brasil em Apuros 13/22, **sem alterar os jogos de plataforma Godot** nem o Boleto Rush.

## Jogar
https://giulianocruz.github.io/brasil-em-apuros-jogar/arcade/

O arcade foi criado como um jogo web próprio e também oferece um manifesto para "Adicionar à tela inicial" no Android/iOS quando o navegador permitir. Não há APK nativo desta edição neste momento.

## Mecânicas v0.2
- Seleção de **quatro caricaturas jogáveis**: Lula e Alckmin (13), Flávio e Eduardo (22), com sprites originais.
- Partidas de **45 e 90 segundos**; três atos visuais com dificuldade gradual.
- Pegue maletas para ganhar pontos, combos e 20% de carga de habilidade por maleta.
- Aperte **PODER** ou **Enter** quando chegar a 100% (cinco maletas).
- Habilidades de fantasia satírica: Lula atrai maletas por 6 s; Alckmin ganha um escudo imediato; Flávio recebe 4 s de proteção; Eduardo limpa os processos na tela e os desacelera por 6 s.
- Obstáculos de papelada, cão Caramelo como escudo de um impacto, café para recuperar vida e até 3 vidas.
- Som opcional, pausa, tutorial, touch, botões acessíveis e teclado A/D/setas.
- Recordes separados por personagem e duração, localmente no navegador; opção de compartilhar resultado.
- Novo resultado com total de poderes ativados.

## Suporte de app no navegador
- `manifest.webmanifest`, `arcade-icon.svg` e `sw.js` dão suporte à instalação na tela inicial e cache do arcade, conforme compatibilidade do navegador.
- Service Worker com escopo **apenas /arcade/**; não controla a urna nem os jogos Godot 13/22.
- Em navegação online, se cache ou imagem falhar, o gameplay mantém placeholders vetoriais.
- Offline depende de uma visita online anterior, instalação/ativação e sucesso do cache inicial. Verifique em celular físico; não apresentar suporte offline como homologado.
- Não existe AdMob na versão web; não há anúncios nem rastreamento.

## Arte e direitos
Sprites de `giulianocruz/BrasilEmApuros_GitHub_v2.4` branch `feat/brasil22-beta46-20261026`, fornecidos pelo mesmo titular. Assets locais em `arcade/assets/` e cenário em `../media/hero13.jpg` ou `../media/hero22.jpg`.

## Qualidade
O projeto contém testes sem navegador externo:
```sh
node --check arcade/game.js
node --check arcade/sw.js
node --test arcade/tests/*.test.mjs
```
O workflow `.github/workflows/arcade-qa.yml` repete os testes em pushes e PRs afetando `arcade/**`. Ainda precisam ser feitos testes de toque e desempenho em telefone Android/iOS reais, checagem visual dos sprites e verificação real do cache offline.

## Publicação
Arquivos estáticos do diretório `arcade/` são publicados via GitHub Pages do repositório `brasil-em-apuros-jogar`. O portal principal inclui acesso dedicado à nova edição. Sem vínculo político institucional, sem contagem de votos reais e sem coleta de dados de usuários.
