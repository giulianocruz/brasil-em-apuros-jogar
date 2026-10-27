import test from 'node:test';
import assert from 'node:assert/strict';

// Simula a API usando a função fetch local, sem rede nem credenciais reais.
const project = 'p'.repeat(16), server = 's'.repeat(16), appId = 'a'.repeat(16);
const knownApp = {
  uuid: appId, name: 'brasil-em-apuros-13-22-web',
  git_repository: 'https://github.com/giulianocruz/brasil-em-apuros-jogar',
  git_branch: 'main', build_pack: 'dockerfile'
};
let index = 0;

async function simulate(action, apps) {
  Object.assign(process.env, {
    COOLIFY_ACTION: action, COOLIFY_BASE_URL: 'https://coolify.example.test',
    COOLIFY_API_TOKEN: 'token-falso-apenas-teste',
    COOLIFY_PROJECT_UUID: project, COOLIFY_SERVER_UUID: server,
    COOLIFY_APP_UUID: ''
  });
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    const u = new URL(url);
    const path = u.pathname, method = opts.method;
    calls.push({path, method, body: opts.body ? JSON.parse(opts.body) : null});
    let response;
    if (path.endsWith('/projects')) response = [{uuid: project}];
    else if (path.endsWith('/servers')) response = [{uuid: server, settings: {is_usable: true}}];
    else if (path.endsWith('/applications') && method === 'GET') response = apps;
    else if (path.endsWith('/applications/public') && method === 'POST') response = {uuid: appId};
    else if (path.endsWith('/applications/' + appId)) response = knownApp;
    else if (path.endsWith('/deploy') && method === 'POST') response = {
      deployments: [{resource_uuid: appId, deployment_uuid: 'd'.repeat(16)}]
    };
    else throw new Error('Rota inesperada: ' + path);
    return {ok: true, status: 200, json: async () => response};
  };
  const mod = await import('./coolify-provision-vps.mjs?test=' + (++index));
  await mod.run();
  return calls;
}

test('inspect é somente leitura', async () => {
  const calls = await simulate('inspect', []);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(x => x.method === 'GET'));
});

test('provision cria somente aplicativo Web, sem domínio raiz', async () => {
  const calls = await simulate('provision', []);
  const create = calls.find(x => x.path.endsWith('/applications/public'));
  assert.ok(create);
  assert.equal(create.body.dockerfile_location, '/deploy/vps/Dockerfile');
  assert.equal(create.body.build_pack, 'dockerfile');
  assert.equal(create.body.ports_exposes, '80');
  assert.equal(create.body.autogenerate_domain, true);
  assert.equal(create.body.instant_deploy, false);
  assert.equal(create.body.domains, undefined);
  assert.equal(calls.filter(x => x.path.endsWith('/deploy')).length, 1);
});

test('redeploy não cria aplicativo duplicado', async () => {
  const calls = await simulate('redeploy', [knownApp]);
  assert.equal(calls.filter(x => x.method === 'POST').length, 1);
});

test('não altera aplicativos homônimos de outro repositório', async () => {
  const another = {...knownApp, git_repository: 'https://github.com/exemplo/outro'};
  await assert.rejects(() => simulate('redeploy', [another]), /configuração divergente/);
});
