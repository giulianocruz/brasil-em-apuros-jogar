# Brasil em Apuros! — Portal dos jogos 13 e 22

Dois jogos de plataforma e sátira ficcional criados com Godot 4.7.2, publicados gratuitamente em versões de teste para navegador, Android e Windows. Não é um projeto eleitoral e não possui vínculo com partidos ou candidatos.

## Navegação

- index.html: portal premium, galeria com imagens reais dos jogos e links de download.
- urna.html: abertura satírica interativa para escolher a edição 13 ou 22 e confirmar o lançamento. A escolha não é gravada, enviada ou contabilizada.
- 13/: exportação Web Godot da campanha Lula/Alckmin.
- 22/: exportação Web Godot da campanha Flávio/Eduardo.
- media/: imagens reais das duas edições.
- tools/verificar-publicacao.mjs: integridade do portal e dos pacotes Web.

## Testar localmente

O site deve ser servido por HTTP(S), não aberto por file://, porque o Godot usa Service Worker para juntar os segmentos do pacote Web.

Execute um servidor HTTP local na raiz do repositório (porta de exemplo 8080):

    npx http-server . -p 8080 -c-1

Acesse http://localhost:8080/urna.html e teste ambas as campanhas. O navegador precisa suportar JavaScript, WebAssembly e Service Workers; na hospedagem pública utilize HTTPS.

## Validar antes de publicar

    node tools/verificar-publicacao.mjs --rapido
    node tools/verificar-publicacao.mjs

O primeiro comando verifica estrutura e tamanhos. O segundo calcula também o SHA-256 dos pacotes segmentados das duas edições. Nenhum dos comandos usa rede ou credenciais. O pull request executa a auditoria automaticamente no GitHub Actions.

Veja docs/PLANO_PUBLICACAO_WEB.md para homologação manual, regeneração dos pacotes a partir do código Godot atualizado, sincronização e reversão.

## Links

- Portal de testes: https://giulianocruz.github.io/brasil-em-apuros-jogar/
- Downloads atuais: https://github.com/giulianocruz/brasil-em-apuros-jogar/releases/tag/v2026.10.26
- Código 13: https://github.com/giulianocruz/BrasilEmApuros13
- Código 22: https://github.com/giulianocruz/BrasilEmApuros_GitHub_v2.4/tree/feat/brasil22-beta46-20261026

**Atenção:** as exportações Web e downloads atuais são anteriores aos commits mais recentes com o cachorro Caramelo. Será necessário gerar novas builds para incluí-lo nas versões públicas.
