# Brasil em Apuros — validação visual de 29/10/2026

Objetivo: reconhecer o protagonista de imediato durante caminhada, pulo e combate, preservando sprites, cenários e identidade das campanhas.

## Prioridade aplicada

1. P0 — castelo, garagem e cofre: dessaturação também da geometria desenhada por código; metade das arcadas, tapeçarias e tochas decorativas; borda neutra clara nas superfícies sólidas.
2. P1 — praça, ruas, distrito e arena: mesmo tratamento de profundidade em todos os cinco painéis e no parallax, incluindo quiosques e placas.
3. P1 — protagonista e efeitos: saturação moderada do sprite, contorno da silhueta por quadro; poeira, chuva e rastros discretos, atrás do jogador. Ícones de perigo e itens continuam reconhecíveis.

## Critérios para assets e próximas fases

| Camada | Critério implementado |
| --- | --- |
| Fundo distante | Saturação relativa 0,28 (13) / 0,26 (22); contraste 0,70; suavização leve somente da arte distante. |
| Grupo complementar | 13: vermelhos do elenco contra azul-petróleo suave. 22: verdes/azuis do elenco contra areia/ocre suave. Pele, roupa e símbolos originais preservados. |
| Decoração e terreno | Saturação 0,48 externo / 0,30 interior; contraste 0,86 / 0,78; nunca aplicar esses materiais ao jogador, inimigos, coletáveis ou HUD. |
| Personagem | Saturação 1,16 e contraste 1,06; contorno escuro de 3 texels (aproximadamente 1–2 pixels na tela), restrito ao quadro atual. Sem halo circular permanente. |
| Superfícies jogáveis | Bordas contínuas e neutras claras; lacunas escuras; manter os retângulos de colisão existentes. |
| Efeitos | Poeira e pouso no z=5; protagonista z=8; impactos z=10. Rastros com alpha 0,22 e duração 0,20s; poeira com alpha máximo 0,32. |
| Revisão visual | Conferir em movimento, em tela pequena, contra fundo claro/escuro, com escudo, tiro rápido e chefe. Complementares são uma direção de paleta: luminância, contorno e posição também devem comunicar foco. |

As artes-fonte não foram regravadas. Os números são parâmetros de renderização, não percentuais de saturação HSV das imagens nem uma alegação de conformidade WCAG.

## Validação realizada

- 28 capturas do build alterado: quatro protagonistas, três pontos externos e quatro salas do castelo por personagem.
- qa_hierarquia_visual.gd: 8 combinações personagem/capítulo, movimento real, animação de corrida, pulo, ataque, buff, pausa e retomada; zero falhas nas duas campanhas.
- smoke_missao.gd, qa_caramelo.gd e smoke_brecha_chefe.gd: aprovados nas duas campanhas.
- Corrigido o desligamento síncrono de monitoring em cinco Area2D, observado no navegador durante a coleta/combate; agora usa set_deferred.
- Dois testes antigos da edição 13 (smoke_dupla_vnext e smoke_animacoes_vnext) ainda pressupõem arte estática/procedural, anterior às spritesheets já existentes; essas premissas falham também na base. O novo QA cobre as spritesheets atuais. Não usar exit code sozinho: verificar SCRIPT ERROR e o marcador final.
- O encerramento de alguns testes antigos e do novo QA registra avisos de recursos/instâncias ainda em uso; não é versão 1.0 estável. A execução de QA no sandbox também pode impedir o cache local de shaders. Os materiais compilaram e as exportações Web foram geradas.

## Reproduzir

Godot 4.7.2: abrir project.godot ou executar o jogo. Para QA:

    Godot --headless --path . --script res://scripts/qa_hierarquia_visual.gd
    Godot --path . --resolution 1152x648 --script res://scripts/qa_contraste_20261029.gd -- DIRETORIO_DE_CAPTURAS

Publicação de validação em /validacao-visual/ no portal de testes GitHub Pages. As campanhas nos endereços principais não são substituídas por este pacote.
