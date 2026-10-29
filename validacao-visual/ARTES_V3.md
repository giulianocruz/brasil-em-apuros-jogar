# Artes V3 — integração no jogo (29/10/2026)

O acervo e a apresentação durante a partida estavam divergentes: ter uma arte na galeria não significava que a cena a usava. Esta versão liga as fontes aprovadas às fases e preserva os originais.

## Alterações aplicadas nas duas edições

| Elemento | Fonte em uso | Aplicação |
|---|---|---|
| Lula e Alckmin | animacoes_elenco | Animações existentes; primeira imagem do jogador já usa a folha correta. |
| Flávio e Eduardo | personagens, folhas próprias | Artes existentes preservadas, sem trocar a identidade de um herói. |
| Janja | animacoes_elenco/janja/resgate_aprovado_sheet.png | Cópia da sequência limpa de vitória da edição 13. Primeiro quadro no menu/cativeiro, seis quadros na libertação. |
| Bolsonaro | animacoes_elenco/bolsonaro/victory_sheet.png | Fonte ilustrada no cativeiro e na libertação. |
| Caramelo | personagens/caramelo/idle.png | Sprite novo com transparência, bandana verde e amarela e respiração discreta; encontro e sinalização mantidos. |
| Chão e plataformas externos | flow_lote11/27_tileset_terreno.jpg | Recortes de solo e grama nos mesmos retângulos físicos do mapa V2. |
| Chão e plataformas do castelo | flow_lote11/13_tileset_castelo.jpg | Alvenaria e acabamento; bordas claras sobre as superfícies reais. |
| Portal | flow_lote12/37_flow.jpg | Última pose recortada, chroma verde removido por shader; estado selado e aberto distintos. |
| Gaiola | flow_lote11/31_gaiola_magica.jpg | Ilustração com branco removido por shader; sobe e desaparece ao abrir o resgate. |
| Armadilha de carimbo | ui/hud/flow_carimbo.png | Ilustração substitui os blocos do golpe; avisos, alcance e temporização preservados. |
| Salas do castelo | castelo_interior/fundo_flow12.jpg; flow_lote13/01_flow.jpg e 02_flow.jpg | Salão, garagem e cofre visíveis sem arcadas, lustres ou tapeçarias geométricas sobrepostos. |

Os cenários segmentados e suas artes existentes continuam ativos. Árvores, quiosques, bancos e fachada geométricos repetidos foram retirados da apresentação principal para revelar essas imagens. Placas de orientação, checkpoints, aviso de perigo e marcadores de selos continuam funcionais.

Os pés do Caramelo foram alinhados ao piso externo e à plataforma interna; os do personagem resgatado usam a base opaca do primeiro quadro, evitando flutuação causada pela margem transparente.

## Critérios para aprovar uma arte no jogo

- Registrar fonte e ponto de uso. Não considerar presença na galeria como integração concluída.
- Verificar transparência/chroma, enquadramento, dimensões por quadro, escala e apoio dos pés.
- Cenários distantes menos saturados; personagem mais saturado e contornado. Manter os grupos complementares definidos para 13 e 22.
- Arte de terreno e área de colisão devem coincidir, inclusive nas extremidades e fendas.
- Efeitos de impacto são breves; os sinais de perigo devem continuar legíveis antes do dano.
- Conferir menu, início da partida, combate, resgate fechado, resgate aberto e resultado.

## Fontes preservadas que exigem tratamento

A folha janja/idle_sheet.png da edição 13 contém chroma verde residual e poses cortadas. Ela foi preservada no acervo, mas não é usada como arte aprovada. As duas edições tinham folhas diferentes com o mesmo nome; a fonte limpa agora tem um nome explícito e comum.

O Caramelo tem uma pose ilustrada com respiração; caminhada e latido com poses desenhadas ainda precisam de uma folha própria. O conjunto de artes cinematográficas e sprites produzidos em lotes diferentes ainda pede uma revisão de estilo. Esta versão não declara a direção de arte finalizada.

## Validação

- qa_artes_integradas.gd: seleção de fontes, quadros íntegros, transparência do mascote, arte da gaiola/portal e libertação animada.
- qa_level_design.gd: 84 saltos reais nos quatro heróis, sem falhas.
- qa_progressao_layout.gd: checkpoints e abertura por três selos nas oito combinações de herói/capítulo, sem falhas.
- smoke_missao.gd, smoke_ia_inimigos.gd e smoke_brecha_chefe.gd: aprovados nas duas edições.
- Capturas de menu, fase externa, salas, cativeiro e libertação para inspeção visual.

O Godot ainda registra avisos de recursos retidos ao encerrar alguns cenários de QA. Isso permanece como pendência de ciclo de vida; os testes funcionais acima terminaram com código zero. Os avisos de diretório de cache do editor pertencem ao ambiente de validação.

A versão web conserva o carregamento em fluxo, progresso em MB e opção de repetir. O primeiro download continua grande; redução do pacote é uma tarefa separada.
