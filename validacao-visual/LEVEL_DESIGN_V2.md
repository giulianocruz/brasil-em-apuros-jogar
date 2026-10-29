# Brasil em Apuros — Level design V2 (29/10/2026)

## Problemas corrigidos

As plataformas anteriores tinham subidas de 120–135 pixels; o salto normal sobe aproximadamente 110. Havia cartuchos/escudos posicionados em fendas e nenhuma primeira parada entre o início e x=1920. Recompensas elevadas não tinham uma sequência consistente de apoios. A primeira plataforma do castelo também bloqueava a cabeça do jogador no salto seguinte.

## Percurso aplicado às duas campanhas

| Trecho externo | Função |
| --- | --- |
| Início–700 | Andar e coletar em segurança; alvo de treino; primeira plataforma de 80 px e maleta opcional; primeiro inimigo após o treino. |
| 700–1550 | Primeira fenda de 100 px, pouso livre, checkpoint em 960, poder de ataque antes do encontro; desvio superior com recompensa. |
| 1550–2480 | Fenda de 140 px, segundo checkpoint em 1920, escada opcional 80+70 px e extra; inimigo em terra firme. |
| 2480–3150 | Fenda de 160 px indicada por moedas em arco; pouso livre, checkpoints e recursos para recuperar o ritmo. |
| 3150–4000 | Preparação e arena existentes; piso contínuo e menos obstáculos concorrendo com o chefe. |

Castelo: primeira plataforma e selo acessíveis, três salas com carimbos separados das zonas de reaparecimento, selos numerados e checkpoints após as fendas. Mantida a orientação do selo mais próximo e a exigência dos três selos para abrir o portal.

## Critérios de implementação

- mapa_fases.gd é a única fonte para pisos, plataformas, encontros, recompensas e checkpoints.
- Subidas iniciais de 80 px; degraus superiores de 70 px; plataformas obrigatórias do castelo entre 80 e 90 px. Não exige corrida ou esquiva para alcançar os apoios.
- Moedas descrevem as curvas de salto. Itens de poder e selos têm superfície de apoio; extras ocupam caminhos superiores opcionais.
- Inimigos terrestres respeitam o chão da própria ilha, com margem de 42 px nas bordas, inclusive durante perseguição.
- Checkpoints sem inimigo terrestre a menos de 200 px do centro, com espaço de pouso e retomada.
- Avisos de fenda, bordas claras e bandeiras discretas; retiradas etiquetas redundantes que sobrepunham os itens.
- A identidade e o contraste da revisão visual anterior continuam ativos. Eduardo mantém Washington; as outras rotas preservam seus cenários e personagens.

## Evidência de teste

- qa_level_design.gd: 84 saltos com física real, nos quatro personagens e dois capítulos, sem falhas. Inclui cada fenda e plataforma, subidas aos bônus, apoio dos itens e separação dos checkpoints. Teste por segmentos, com velocidade normal de caminhada e espaço de aproximação; não é uma prova de conclusão humana em celular.
- qa_progressao_layout.gd: oito combinações personagem/capítulo, ativação dos checkpoints, coleta real dos três selos e abertura do portal; zero falhas. Inimigos e carimbos isolados neste teste de progressão.
- qa_hierarquia_visual.gd: movimento, pulo, ataque, buff e pausa continuam aprovados.
- smoke_missao.gd, smoke_ia_inimigos.gd e smoke_brecha_chefe.gd aprovados nas duas campanhas.
- 28 capturas revisadas; cenas externas e interior renderizados com a nova geometria. Exportações Web geradas.
- Alguns testes de integração ainda registram recursos/instâncias em uso no encerramento; isto não foi tratado como aprovação de uma versão final 1.0. A versão permanece de validação e precisa de avaliação humana de ritmo/dificuldade, especialmente com controles de toque.

## Reproduzir

    Godot --headless --fixed-fps 60 --path . --script res://scripts/qa_level_design.gd
    Godot --headless --fixed-fps 60 --path . --script res://scripts/qa_progressao_layout.gd

Versão jogável: /validacao-visual/ no portal de testes. Identificação no menu: FASES V2.
