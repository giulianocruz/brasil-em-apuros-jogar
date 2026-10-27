#!/usr/bin/env node
/**
 * Publicação isolada no Coolify usando a API oficial.
 * Ações manuais: inspect (somente leitura), provision (cria se ausente), redeploy.
 * Não modifica DNS, apps existentes ou a República dos Malandros PHP.
 */
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const NAME = 'brasil-em-apuros-13-22-web';
const REPO = 'giulianocruz/brasil-em-apuros-jogar';
const REPO_URL = 'https://github.com/' + REPO;
const ACTION = process.env.COOLIFY_ACTION || 'inspect';
const BASE = (process.env.COOLIFY_BASE_URL || '').replace(/\/+$/, '');
const TOKEN = process.env.COOLIFY_API_TOKEN || '';
const PROJECT = process.env.COOLIFY_PROJECT_UUID || '';
const SERVER = process.env.COOLIFY_SERVER_UUID || '';
const APP_OVERRIDE = process.env.COOLIFY_APP_UUID || '';
const isId = x => /^[a-zA-Z0-9-]{8,128}$/.test(x);
const fail = msg => { throw new Error(msg); };
const say = msg => process.stdout.write(msg + '\n');
const summary = msg => {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, msg + '\n');
};
const normalizedRepo = raw => String(raw || '').replace(/\.git$/, '')
  .replace(/^https?:\/\/github\.com\//, '').replace(/^git@github\.com:/, '')
  .replace(/^\/+/, '').toLowerCase();

function validate() {
  if (!['inspect', 'provision', 'redeploy'].includes(ACTION)) fail('Ação inválida.');
  if (!TOKEN) fail('Cadastre COOLIFY_API_TOKEN em GitHub Actions Secrets.');
  if (!BASE) fail('Cadastre COOLIFY_BASE_URL em GitHub Actions Variables.');
  let u;
  try { u = new URL(BASE); } catch { fail('COOLIFY_BASE_URL inválida.'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/') {
    fail('Use o domínio HTTPS do seu Coolify sem caminhos, credenciais ou parâmetros.');
  }
  if (ACTION !== 'inspect' && (!isId(PROJECT) || !isId(SERVER))) {
    fail('Cadastre os UUIDs COOLIFY_PROJECT_UUID e COOLIFY_SERVER_UUID.');
  }
  if (APP_OVERRIDE && !isId(APP_OVERRIDE)) fail('COOLIFY_APP_UUID inválido.');
}

async function api(method, route, body) {
  const r = await fetch(BASE + '/api/v1' + route, {
    method,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(25000)
  });
  // Nunca imprimir corpos de erro: podem conter dados da infraestrutura.
  if (!r.ok) fail('Coolify ' + method + ' ' + route.split('?')[0] +
    ': HTTP ' + r.status + '. Confira permissões e autorização da API.');
  try { return await r.json(); }
  catch { fail('Coolify retornou JSON inválido.'); }
}

function checkApp(app) {
  if (!app || app.name !== NAME || normalizedRepo(app.git_repository) !== REPO ||
      app.git_branch !== 'main' || app.build_pack !== 'dockerfile') {
    fail('Aplicação com nome esperado possui fonte ou configuração divergente. Alteração bloqueada.');
  }
}

export async function run() {
  validate();
  const [projects, servers, apps] = await Promise.all([
    api('GET', '/projects'), api('GET', '/servers'), api('GET', '/applications')
  ]);
  if (![projects, servers, apps].every(Array.isArray)) fail('Inventário Coolify inesperado.');
  say('API Coolify autorizada. Projetos: ' + projects.length + '; servidores: ' + servers.length + '.');
  if (ACTION === 'inspect') {
    say('Inspeção concluída sem alterações. Configure projeto/servidor e execute provision.');
    summary('### Brasil em Apuros / Coolify\nInspeção segura concluída. Nenhuma alteração.');
    return;
  }
  if (!projects.some(x => x.uuid === PROJECT)) fail('Projeto não encontrado no escopo do token.');
  const targetServer = servers.find(x => x.uuid === SERVER);
  if (!targetServer) fail('Servidor não encontrado no escopo do token.');
  if (targetServer.settings?.is_usable === false || targetServer.settings?.is_reachable === false) {
    fail('VPS reportada como indisponível. Implantação interrompida.');
  }
  const matches = apps.filter(x => x.name === NAME);
  if (matches.length > 1) fail('Aplicações duplicadas com mesmo nome. Inspecione no painel.');
  let app = matches[0];
  if (APP_OVERRIDE) {
    const explicit = apps.find(x => x.uuid === APP_OVERRIDE);
    if (!explicit) fail('UUID da aplicação informada não foi encontrado.');
    checkApp(explicit);
    if (app && app.uuid !== explicit.uuid) fail('UUID não corresponde ao nome da aplicação.');
    app = explicit;
  }
  if (!app) {
    if (ACTION !== 'provision') fail('Aplicação não encontrada. Escolha provision.');
    say('Criando somente a aplicação Web, sem domínio principal ou banco de dados.');
    const result = await api('POST', '/applications/public', {
      project_uuid: PROJECT,
      server_uuid: SERVER,
      environment_name: process.env.COOLIFY_ENVIRONMENT_NAME || 'production',
      git_repository: REPO_URL,
      git_branch: 'main',
      build_pack: 'dockerfile',
      base_directory: '/',
      dockerfile_location: '/deploy/vps/Dockerfile',
      ports_exposes: '80',
      name: NAME,
      description: 'Brasil em Apuros 13 e 22 — Web, independente do PHP legado',
      autogenerate_domain: true,
      is_force_https_enabled: true,
      is_auto_deploy_enabled: false,
      health_check_enabled: true,
      health_check_path: '/health',
      health_check_port: '80',
      health_check_method: 'GET',
      health_check_return_code: 200,
      instant_deploy: false
    });
    if (!isId(result?.uuid)) fail('Coolify não confirmou UUID: consulte painel antes de nova tentativa.');
    app = await api('GET', '/applications/' + encodeURIComponent(result.uuid));
  }
  checkApp(app);
  const reply = await api('POST', '/deploy?uuid=' + encodeURIComponent(app.uuid));
  if (!Array.isArray(reply.deployments) || !reply.deployments.length) {
    fail('Solicitação não confirmada pela API; consulte o painel Coolify.');
  }
  say('Solicitação de deploy aceita. Confirme conclusão no Coolify e teste os jogos.');
  summary('### Brasil em Apuros / Coolify\nDeploy solicitado. Verifique o estado do contêiner no Coolify. O domínio principal não foi alterado.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch(error => { console.error('ERRO: ' + error.message); process.exitCode = 1; });
}
