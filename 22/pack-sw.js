'use strict';
// Configuracao substituida pelo empacotador; nao junta os pacotes na memoria do worker.
const PACK = {"version":"08ae6d04e173","size":121770608,"parts":[{"name":"index.pck.part01","size":44040192},{"name":"index.pck.part02","size":44040192},{"name":"index.pck.part03","size":33690224}]};
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const requested = new URL(event.request.url);
  const target = new URL('index.pck', self.location.href);
  if (requested.origin !== target.origin || requested.pathname !== target.pathname) return;
  event.respondWith(streamPack(event));
});
function streamPack(event) {
  let active = null;
  let cancelled = false;
  let loaded = 0;
  let lastMessage = 0;
  const tell = async (type, extra = {}) => {
    if (!event.clientId || !self.clients.get) return;
    const client = await self.clients.get(event.clientId);
    client?.postMessage({type, loaded, total: PACK.size, version: PACK.version, ...extra});
  };
  const body = new ReadableStream({
    async start(output) {
      try {
        for (let index = 0; index < PACK.parts.length; index++) {
          const part = PACK.parts[index];
          let offset = 0;
          let completed = false;
          for (let attempt = 0; attempt < 3 && !completed; attempt++) {
            if (cancelled) return;
            active = new AbortController();
            let idle;
            const heartbeat = () => { clearTimeout(idle); idle = setTimeout(() => active?.abort(), 20000); };
            heartbeat();
            try {
              const url = new URL(part.name, self.location.href);
              url.searchParams.set('v', PACK.version);
              const response = await fetch(url, {cache: 'default', signal: active.signal, headers: offset ? {Range: 'bytes=' + offset + '-'} : {}});
              heartbeat();
              if (!response.ok) throw new Error('Parte ' + (index + 1) + ': HTTP ' + response.status);
              const range = response.headers.get('Content-Range');
              if (response.status === 206 && (!range || Number(range.match(/^bytes (\d+)-/)?.[1]) !== offset)) throw new Error('Resposta parcial invalida');
              if (!response.body) throw new Error('Navegador sem transferencia continua');
              // Alguns servidores ignoram Range. Descartar somente o prefixo ja entregue.
              let skip = response.status === 206 ? 0 : offset;
              const reader = response.body.getReader();
              try {
                while (true) {
                  const chunk = await reader.read();
                  heartbeat();
                  if (chunk.done) break;
                  if (cancelled) { await reader.cancel(); return; }
                  let bytes = chunk.value;
                  if (skip) { const discard = Math.min(skip, bytes.byteLength); skip -= discard; bytes = bytes.subarray(discard); }
                  if (!bytes.byteLength) continue;
                  if (offset + bytes.byteLength > part.size) throw new Error('Tamanho inesperado da parte ' + (index + 1));
                  output.enqueue(bytes);
                  offset += bytes.byteLength;
                  loaded += bytes.byteLength;
                  if (Date.now() - lastMessage > 160 || loaded === PACK.size) {
                    lastMessage = Date.now();
                    void tell('brasil:pack-progress', {part: index + 1, parts: PACK.parts.length});
                  }
                }
              } finally { reader.releaseLock(); }
              if (offset !== part.size) throw new Error('Transferencia incompleta da parte ' + (index + 1));
              completed = true;
            } catch (error) {
              if (cancelled) return;
              if (attempt === 2) throw error;
              void tell('brasil:pack-retry', {part: index + 1, attempt: attempt + 2});
              await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
            } finally { clearTimeout(idle); }
          }
        }
        if (loaded !== PACK.size) throw new Error('Pacote incompleto');
        output.close();
      } catch (error) {
        void tell('brasil:pack-error', {message: error.message});
        output.error(error);
      }
    },
    cancel() { cancelled = true; active?.abort(); }
  });
  return new Response(body, {status: 200, headers: {'Content-Type':'application/octet-stream','Content-Length': String(PACK.size), 'Cache-Control':'no-store'}});
}
