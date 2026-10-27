# Brasil em Apuros! — Correria no Planalto (minigame 0.1)

Spin-off satírico e independente do jogo Godot 13/22 e do Boleto Rush Android. HTML5 Canvas, CSS, JavaScript puro, sem bibliotecas, APIs, rastreamento ou anúncios. **Não altera as campanhas originais.**

## Mecânica

- Partidas Clássico 45 s e Maratona 90 s.
- Escolha satírica entre duas equipes: 13 (Lula e Alckmin) e 22 (Flávio e Eduardo).
- Controle por toque/arrasto no celular, teclado nas setas ou teclas A/D, botões de direção acessíveis.
- Colete maletas (pontos e combos), evite processos (dano), receba proteção do cachorro caramelo (escudo de um impacto), ganhe vida extra com café.
- 3 vidas; pausa/resume; placar; recorde salvo apenas no navegador, por personagem + duração; compartilhar pontuação.
- Sem votação real, sem coleta ou envio de dados e sem campanha eleitoral; sátira claramente fictícia.

## Assets reutilizados

Os PNGs abaixo foram copiados dos repositórios **do mesmo titular** `giulianocruz/BrasilEmApuros_GitHub_v2.4`, branch `feat/brasil22-beta46-20261026`, mantendo a autoria e sem copiar arquivos internos do jogo Godot:

- `assets/lula_idle.png`, `assets/lula_run.png`
- `assets/alckmin_idle.png`, `assets/alckmin_run.png`
- `assets/flavio_idle.png`, `assets/flavio_run.png`
- `assets/eduardo_idle.png`, `assets/eduardo_run.png`
- `assets/maleta.png`

O fundo usa `../media/scene_castelo.jpg`, já publicado neste portal. Os sprites são renderizados frame a frame em Canvas.

## Rodar/testar

Servir o diretório raiz do portal via HTTP (ex.: `python -m http.server 8080`); abrir `http://localhost:8080/arcade/` em navegador moderno ou `https://giulianocruz.github.io/brasil-em-apuros-jogar/arcade/` quando Pages publicar a mudança.

O jogo permanece jogável mesmo se um PNG falhar (fallback vetorial). A versão web não integra AdMob Android: anúncios opcionais dependem de um aplicativo nativo e de nova configuração de privacidade.

## Próximos passos de QA

- Teste físico Android/iOS e navegação portrait na tela pequena.
- Conferir visual de sprites em aparelhos com DPR elevado, fluidez e orientação.
- Se aprovado, empacotar como app Android separado do Boleto Rush com identidade visual própria.
