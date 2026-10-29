import {readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const template=await readFile(path.join(root,'tools/web-pack-sw.template.js'),'utf8');
for(const folder of ['13','22','validacao-visual/13','validacao-visual/22']){
  const dir=path.join(root,folder);
  const previous=await readFile(path.join(dir,'index.html'),'utf8');
  const match=previous.match(/const GODOT_CONFIG = (.+);/)||previous.match(/window.BRASIL_BOOT = (.+);/);
  if(!match)throw Error('Configuracao ausente: '+folder);
  const config=JSON.parse(match[1]);
  const manifest=JSON.parse(await readFile(path.join(dir,'pack-manifest.json'),'utf8'));
  const version=manifest.sha256.slice(0,12);
  const parts=await Promise.all(manifest.parts.map(async name=>({name,size:(await stat(path.join(dir,name))).size})));
  if(parts.reduce((sum,p)=>sum+p.size,0)!==manifest.size)throw Error('Tamanho inconsistente: '+folder);
  config.packVersion=version;
  config.workerVersion='stream-1-'+version;
  config.fileSizes['index.pck']=manifest.size;
  const edition=folder.endsWith('22')?'22':'13';
  const assets=folder.startsWith('validacao-visual')?'../../':'../';
  const html=`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Brasil em Apuros! ${edition} · Carregamento</title>
<link rel="icon" href="index.icon.png"><link rel="apple-touch-icon" href="index.apple-touch-icon.png">
<link rel="stylesheet" href="${assets}desktop-controls.css?v=1">
<style>
*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#101b21;color:#f3e9d1;font:16px/1.5 system-ui,sans-serif;touch-action:none}#canvas{display:block;margin:0;border:0}#canvas:focus{outline:none}#status{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:radial-gradient(ellipse at top,#284147,#101b21 75%);padding:24px}.boot-card{width:min(100%,510px);padding:30px;border:1px solid #667365;border-radius:16px;background:#15262df5;box-shadow:0 24px 80px #0005}.brand{display:flex;align-items:center;gap:16px}.brand img{width:64px;height:64px;border-radius:12px}.eyebrow{font-size:12px;letter-spacing:.12em;color:#dfc287}h1{font-size:clamp(24px,5vw,32px);line-height:1.2;margin:5px 0}#startup-detail{margin-top:30px;font-weight:650;min-height:48px}#status-progress{width:100%;height:14px;accent-color:#dbc184;margin:12px 0}#startup-amount{color:#d3dfdc;min-height:26px;overflow-wrap:anywhere}.hint{font-size:14px;color:#aabfbd;margin:20px 0 0}button{border:0;border-radius:8px;background:#dfc287;color:#14242a;padding:13px 20px;font:700 16px system-ui;cursor:pointer;margin-top:20px}a{color:#d6c89e;font-size:14px;display:inline-block;margin-top:22px}[hidden]{display:none!important}
</style></head><body>
<canvas id="canvas" tabindex="0">Seu navegador precisa suportar Canvas para jogar.</canvas>
<div id="status"><section class="boot-card"><div class="brand"><img src="index.icon.png" alt=""><div><div class="eyebrow">PRÓXIMA ERA · EDIÇÃO ${edition}</div><h1>Brasil em Apuros!</h1></div></div><div id="startup-detail" role="status" aria-live="polite">Preparando a aventura…</div><progress id="status-progress" aria-label="Progresso do carregamento" value="0" max="100"></progress><div id="startup-amount">O progresso aparecerá aqui.</div><p class="hint">A primeira abertura baixa cerca de 160 MB. Mantenha esta aba aberta durante o carregamento.</p><button id="startup-retry" type="button" hidden>Tentar novamente</button><br><a href="../">Voltar à seleção dos jogos</a></section></div>
<noscript>Ative o JavaScript para jogar.</noscript>
<script>window.BRASIL_BOOT = ${JSON.stringify(config)};</script>
<script defer src="index.js"></script>
<script defer src="${assets}stream-loader.js?v=stream-1"></script>
<script defer src="${assets}desktop-controls.js?v=1"></script>
</body></html>`;
  await writeFile(path.join(dir,'index.html'),html);
  await writeFile(path.join(dir,'pack-sw.js'),template.replace('__PACK_CONFIG__',JSON.stringify({version,size:manifest.size,parts})));
  console.log(folder+': streaming '+parts.length+' partes / '+manifest.size+' bytes');
}
