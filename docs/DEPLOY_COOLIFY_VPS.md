# Brasil em Apuros 13/22 na VPS com Coolify

**Objetivo:** executar o portal e as duas builds Web Godot diretamente na VPS (Docker/Nginx), sem usar a hospedagem compartilhada Hostinger e sem depender do GitHub Pages como servidor dos jogos. O código e as mídias vêm deste repositório público.

## O que esta aplicação contém

- `/`: portal premium com links para Web, Android RC2 e Windows RC2.
- `/urna.html`: escolha fictícia entre as campanhas 13 e 22.
- `/13/` e `/22/`: exportações reais do Godot (Service Worker + WebAssembly + segmentos `.pck.partNN`), com Caramelo.
- `/health`: resposta `200 ok` do servidor HTTP.

Esta aplicação é **estática**: sem PHP, MySQL, usuários ou tabelas. Ela **não substitui** o jogo PHP original da República dos Malandros em `republicadosmalandros.com.br`; a migração daquele sistema requer uma aplicação PHP e banco de dados separados.

## Criar no Coolify (aplicação nova, não substituir outras)

1. Abrir o Coolify da VPS, escolher o projeto/ambiente adequado e **+ New → Public Repository**.
2. Repository URL: `https://github.com/giulianocruz/brasil-em-apuros-jogar`.
3. Branch: `main`; Build strategy / Build Pack: **Dockerfile**.
4. Base Directory: `/`; Dockerfile Location: `/deploy/vps/Dockerfile`.
5. Ports Exposes: `80`. **Não** publicar a porta 80 do contêiner diretamente no host; o proxy Traefik gerencia TLS e roteamento.
6. Criar inicialmente com o domínio temporário de teste oferecido pelo Coolify. Fazer o primeiro **Deploy** e verificar a aba Logs/Health.
7. Após confirmar tudo, configurar o domínio próprio da aplicação, por exemplo `https://jogos.republicadosmalandros.com.br`. Criar o registro DNS **A** desse subdomínio apontando para o IP **atual** da VPS. Esperar a propagação e a emissão automática do certificado HTTPS.
8. Habilitar os deploys automáticos da branch `main` no Coolify, se desejado.

**Importante:** confirmar o endereço público atual da VPS diretamente no Coolify/servidor antes de alterar qualquer DNS. Em 27/10/2026, a conexão SSH autorizada do Insano acessou o host da VPS, porém nenhuma alteração de DNS foi executada.

## Testes de aceitação

Abrir pelo novo endereço HTTPS (obrigatório para o Service Worker):

- `/`, `/urna.html`, `/13/`, `/22/`: HTTP 200.
- `/13/index.wasm` e `/22/index.wasm`: HTTP 200 e Content-Type `application/wasm`.
- `/13/index.pck.part01` e `/22/index.pck.part01`: HTTP 200; os outros segmentos também devem estar acessíveis.
- `/13/pack-sw.js` e `/22/pack-sw.js`: HTTPS 200 e registro correto do Service Worker.
- Em Chrome, clicar para iniciar as duas campanhas e conferir menu, personagem, fases, HUD, som e controles, especialmente em Android. O teste HTTP não substitui o teste real de gameplay.
- `/health`: HTTP 200, corpo `ok`.
- Confirmar que o portal atual da República, login, dados de jogadores e outros serviços da VPS **não sofreram mudanças**.

## Futuro: domínio principal da República

O repositório `giulianocruz/republica-malandros-deploy` já inclui `deploy/vps/Dockerfile`, `deploy/vps/entrypoint.sh` e a nova landing premium. **Esse app PHP não é igual ao portal estático acima:** o entrypoint exige a variável secreta `REPUBLICA_DB_PHP_B64`; `REPUBLICA_APP_KEY_PHP_B64` conserva a chave criptográfica já existente. É preciso inventariar e migrar o MySQL, restaurar os dados na VPS, verificar login e admin, configurar backup e testar em domínio de homologação antes de mover o DNS do domínio raiz. Não gerar banco vazio nem substituir a chave antiga.

Enquanto isso, o domínio principal da República continua inalterado na hospedagem antiga. Nunca apontá-lo para a aplicação estática sem decidir conscientemente o destino do jogo PHP e dos cadastros existentes.

## Como reverter

No Coolify, selecionar a última implantação estável da nova aplicação e executar rollback/redeploy. Em caso de erro, retirar **apenas** o domínio da nova aplicação. A hospedagem antiga e os demais contêineres permanecem inalterados.

## Deploy automatizado via GitHub, opcional

A workflow manual `.github/workflows/deploy-coolify-web.yml` aciona o deploy da aplicação **já cadastrada** pelo Coolify, sem manipular SSH ou segredos em arquivos. Para ativá-la:

- Cadastrar **Secrets → Actions → `COOLIFY_API_TOKEN`** no repositório GitHub; criar token com privilégios mínimos no Coolify e não colar em comentários ou no repositório.
- Cadastrar **Variables → Actions → `COOLIFY_BASE_URL`** (URL HTTPS do painel/API próprio) e `COOLIFY_APP_UUID` (UUID exato da nova aplicação).
- Em GitHub → Actions → **Deploy Brasil em Apuros na VPS** → **Run workflow**, executar a partir de `main`.
- A workflow solicita implantação do recurso existente; não cria aplicações nem modifica DNS. Conferir estado em Coolify → Deployments.

Referências: https://coolify.io/docs/applications/builds/dockerfile e https://coolify.io/docs/api/endpoints/deployments/deploy-by-tag-or-uuid.
