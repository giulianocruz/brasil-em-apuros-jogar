# Correção do carregamento Web — 29/10/2026

## Diagnóstico

O carregador anterior aguardava os três arquivos de aproximadamente 42 MB em Promise.all(), criava ArrayBuffers e depois um Blob antes de responder ao motor. Nesse período o download do motor podia mostrar 39,5 MB e o progresso parecer congelado. Não havia timeout/repetição dos segmentos nem uma mensagem clara durante a montagem. Na reprodução pública, a campanha 13 terminou de abrir, mas houve essa espera sem progresso do pacote; não é uma reprodução de toda configuração de dispositivo do usuário.

## Correção

- Resposta imediata com Content-Length e ReadableStream; partes transferidas em sequência, sem a montagem integral no Service Worker.
- Progresso visível por parte, percentual e MB; fase de preparação dos personagens separada do download.
- Até três tentativas por parte. Interrupções retomam do byte recebido com Range; se o servidor ignorar Range, o prefixo é descartado sem duplicação de dados.
- Limite de 20 segundos de inatividade na transferência e mensagem de recuperação; botão de nova tentativa, preservando o armazenamento do jogo.
- Ativação confirmada da versão nova do Service Worker, evitando iniciar com o controlador anterior.
- HTTP cache por URL versionada; deixou de forçar novo download de todas as partes a cada abertura.
- Correção aplicada em /13/, /22/, /validacao-visual/13/ e /validacao-visual/22/.

Os pacotes de gameplay e suas hashes não foram alterados. A primeira abertura ainda transfere cerca de 160 MB por edição; a melhoria reduz buffers extras e torna o progresso observável, mas não é uma alegação de benchmark de memória/tempo em celulares reais.

## Validação

- Sete testes automatizados do worker: primeiro bloco antes do pacote completo, ordem/integridade, erro HTTP temporário, interrupção no meio com Range, servidor que ignora Range, falha permanente limitada e isolamento por origem/escopo.
- Auditoria de arquivos e SHA-256 das quatro entradas Web.
- Campanha 22 aberta no navegador local com o carregador novo; progresso por parte observado, chegada ao menu e nenhum erro de console nessa abertura. Captura em validacao-visual/loading-fixed-22.png.
- Após a publicação, a campanha 13 abriu até o menu no endereço público com cache anterior, exibiu avanço real por parte e não registrou erro de console. Captura em validacao-visual/loading-fixed-13.png.

## Regenerar o carregador

    node tools/atualizar-carregador.mjs
    node --test tools/web-pack-sw.test.mjs
    node tools/verificar-publicacao.mjs
