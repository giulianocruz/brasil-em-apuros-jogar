# Aventura V4 — continuidade da missão (29/10/2026)

O primeiro checkpoint do percurso V2 (x=960) era rejeitado pela lista antiga de salvamento. O castelo não tinha continuação após derrota, e a reabertura sempre começava no capítulo externo. A V4 corrige esses fluxos nas campanhas 13 e 22 e preserva as artes da V3.

## Comportamento

- O menu oferece Continuar com herói, capítulo e quantidade de selos. O foco do teclado/controle começa nessa opção quando existe uma missão salva.
- Todos os checkpoints atuais do mapa são aceitos: externos 960, 1920 e 2890; castelo 800, 1715 e 2540; início de capítulo e área do guardião também são tratados.
- A bandeira mais recente fica dourada; anteriores ficam verdes e as ainda não ativadas ficam discretas.
- Entrar no castelo, ativar um checkpoint, coletar um selo, derrotar o guardião, pausar, voltar ao menu e perder o foco acionam salvamento.
- A continuação do castelo preserva quais selos foram coletados, mesmo fora de ordem. Eles não reaparecem, e o portal continua aberto se os três já foram obtidos.
- A tela de derrota oferece Continuar do checkpoint no castelo. A retomada recompõe três vidas e dá proteção temporária de 2,4 segundos.
- O guardião derrotado não reaparece ao retomar a fase externa. Concluir o capítulo externo deixa uma continuação na entrada do castelo, mesmo antes de apertar o botão de avançar.
- A vitória final limpa a missão em andamento. Iniciar outra partida ou usar Reiniciar fase cria um novo progresso para a campanha escolhida.

## Persistência

progresso_partida.gd centraliza validação, leitura e gravação. O formato 2 contém edição, herói, capítulo, checkpoint, identificadores dos selos e estado do guardião. As posições válidas vêm de mapa_fases.gd. Dados com edição/herói incompatíveis, valores não finitos, capítulo desconhecido, posição inválida ou selos duplicados/fora da lista são rejeitados.

A gravação usa arquivo temporário validado, cópia anterior válida e renomeação. A leitura pode recuperar a cópia anterior quando a principal está inválida. Arquivos antigos com apenas herói e checkpoint continuam reconhecidos. O legado da edição 13 com nome antigo é migrado e renomeado como .migrado depois de uma gravação bem-sucedida.

Mensagens de checkpoint distinguem progresso salvo de checkpoint ativo apenas durante a partida quando há falha de escrita.

O progresso fica neste dispositivo/navegador. A retomada preserva objetivos da missão; recompõe vidas e reinicia contadores de moedas, inimigos, bônus e tempo, como uma nova tentativa. Poderes temporários e posições dos inimigos não são persistidos. Não há sincronização de partidas entre aparelhos.

## Evidências

- qa_continuidade.gd: 20 cenários de integração nas duas edições, sem falhas. Inclui todos os checkpoints externos e quatro heróis, instâncias novas lendo o arquivo real, coleta física dos selos fora de ordem, pausa/menu, derrota por dano, botão de retorno, selos restantes, portal aberto, chefe derrotado e passagem ao castelo.
- Testes adicionais de formato antigo, arquivo inválido, cópia de recuperação, substituição de arquivo e erro de escrita.
- Regressão: 84 saltos com física real; progressão nas oito combinações herói/capítulo; movimento, pulo, ataque, poderes, pausa, artes, IA e chefe aprovados.
- Oito capturas de menu, derrota, retomada e resumo de pausa; exportações Web das duas campanhas concluídas.
- Alguns testes ainda registram recursos retidos no encerramento do Godot; o ambiente de exportação também registra avisos de diretórios do editor. Isto permanece como pendência de qualidade e não constitui certificação de estabilidade 1.0.

Para reproduzir os cenários de continuidade sem tocar em partidas reais:

    Godot --headless --fixed-fps 60 --path . --script res://scripts/qa_continuidade.gd -- DIRETORIO_TEMPORARIO

A página de validação identifica o jogo no menu como AVENTURA V4. O carregador em fluxo e o progresso em MB foram mantidos. A primeira abertura continua baixando aproximadamente 160 MB por campanha.
