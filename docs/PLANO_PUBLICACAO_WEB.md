# Brasil em Apuros! — checklist de publicação Web

**Data da preparação:** 26/10/2026.  
**Objetivo:** colocar as duas campanhas jogáveis no site sem quebrar a versão pública anterior.

## Estado encontrado no GitHub

- O portal principal está em index.html, e a escolha satírica da campanha em urna.html.
- As pastas 13/ e 22/ contêm exportações Web já segmentadas (index.pck.part01..03, index.wasm, loader e Service Worker).
- A release `v2026.10.26` contém os APKs **Android RC1** (anteriores à integração do Caramelo) e os primeiros ZIPs Windows.
- O commit `39ee80f` de 26/10 atualizou **as duas exportações Web** com o Caramelo. O deploy GitHub Pages do commit `b0cbbe3` concluiu com sucesso em 26/10; ainda é necessário validar o jogo aberto no navegador.
- A release `v2026.10.26.2` contém os ZIPs **Windows RC2** com o Caramelo. Os APKs Android ainda requerem novas builds a partir dos fontes atuais.
- Código mais recente da edição 13: giulianocruz/BrasilEmApuros13, branch main.
- Código mais recente da edição 22: giulianocruz/BrasilEmApuros_GitHub_v2.4, branch feat/brasil22-beta46-20261026. A branch padrão do repositório 22 é outra; não exportar a padrão por engano.
- A página da urna **só direciona** para o jogo escolhido. Os personagens Lula/Alckmin e Flávio/Eduardo continuam sendo escolhidos dentro de seus jogos.
- A urna não envia dados, armazena votos ou representa uma eleição real.

## Validação automática do portal

Na raiz do repositório Web, execute com **Node.js 18+**:

    node tools/verificar-publicacao.mjs

Para verificar rapidamente caminhos e tamanhos, sem ler os pacotes de centenas de MB:

    node tools/verificar-publicacao.mjs --rapido

O verificador confere links locais, navegação 13/22, integridade dos segmentos .pck (inclusive SHA-256 na execução completa), WebAssembly e configuração de carregamento do Godot. O GitHub Actions executa a verificação completa em pull requests.

**Limite:** testes estáticos não substituem abrir o jogo no navegador nem passar as duas campanhas completas.

## Próximo ciclo: atualizar os APKs Android

1. Usar o código atual do 13 (`main`) e o código atual do 22 (`feat/brasil22-beta46-20261026`), sem exportar por engano a branch padrão antiga do 22.
2. Reexecutar os testes automatizados, especialmente `qa_caramelo.gd`, e testar personagens, chefes, resgates e controles multitouch.
3. Exportar os dois APKs Android para uma nova RC; conferir IDs de pacote diferentes, versionCode e assinatura de distribuição, sem subir chaves para o GitHub.
4. Instalar e verificar em aparelho Android real. Somente depois anexar os novos APKs à release e atualizar os links do portal.

## Antes de atualizar o Web

1. Trabalhar em branch separada e confirmar que não há alterações locais não enviadas em nenhum dos dois jogos.
2. No Godot **4.7.2**, carregar a main atual da edição 13 e a branch feat/brasil22-beta46-20261026 da edição 22.
3. Executar os scripts de smoke pertinentes de cada edição, incluindo smoke_missao.gd, qa_caramelo.gd e os testes de resgate/chefes. Os testes renderizados devem ser executados com renderização gráfica quando necessário.
4. Testar manualmente ambos os protagonistas por edição, inclusive controles simultâneos no celular.
5. Exportar Web para uma pasta de **staging**, nunca por cima de 13/ ou 22/ da publicação anterior.
6. Verificar que os novos arquivos Godot têm o loader de pacotes segmentados: o repositório exige pack-sw.js e pack-manifest.json compatíveis com cada .pck.
7. Separar qualquer .pck maior que o limite individual do GitHub em partes menores que 100 MiB, atualizar manifesto (tamanho total, partes, SHA-256) e o Service Worker. Não copiar um novo .pck bruto sem sincronizar o carregador.
8. Executar node tools/verificar-publicacao.mjs com os novos arquivos em staging/revisão e comparar a saída com a versão anterior.
9. Fazer commit dos novos exports; validar o PR e então promover a versão por merge/deploy consciente.

## Homologação manual obrigatória

- [ ] A home abre sem erro e o CTA principal aponta para urna.html.
- [ ] O usuário consegue escolher 13, confirmar e carregar a campanha correta.
- [ ] O usuário consegue escolher 22, confirmar e carregar a campanha correta.
- [ ] Sem JavaScript na página da urna, os cartões continuam com links diretos.
- [ ] Os dois carregadores terminam de baixar os segmentos sem erro 404 ou memória insuficiente.
- [ ] Lula, Alckmin, Flávio e Eduardo aparecem, se movem, pulam e atacam corretamente.
- [ ] Maletas, cartucho, escudo, esquiva, inimigos, chefe, checkpoint e vitória funcionam.
- [ ] Janja e Bolsonaro são exibidos somente nas histórias corretas.
- [ ] O cachorro Caramelo aparece e se movimenta nas duas edições Web/Windows RC2 após teste manual; as builds Android RC1 ainda não foram atualizadas.
- [ ] Android físico, navegador mobile em paisagem e desktop tiveram controles/áudio avaliados.
- [ ] Downloads APK/Windows levam aos arquivos corretos de uma release existente.
- [ ] O domínio definitivo serve a mesma versão aprovada, sem afetar o jogo República dos Malandros.

## Reversão e sincronização

Preservar o commit/release anterior e não apagar 13/, 22/ ou conteúdo de República dos Malandros até passar na homologação. Se houver falha grave após publicar, restaurar o commit anterior do portal e os respectivos arquivos Web como um conjunto coerente.

GitHub: fontes, scripts, cenas, builds Web e histórico. Google Drive: mídias Flow originais, APKs, ZIPs Windows e arquivos de trabalho. Nunca versionar senhas, tokens, chaves de assinatura ou arquivos .env.
