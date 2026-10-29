import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const template = await readFile(new URL('./web-pack-sw.template.js', import.meta.url), 'utf8');
const bytes = Uint8Array.from({length:96}, (_,i)=>i);
const config = {version:'fixture',size:96,parts:[{name:'part1',size:48},{name:'part2',size:48}]};
function worker(fetcher, options={}) {
  const calls=[];
  const handlers={};
  const context=vm.createContext({ReadableStream,Response,Headers,URL,AbortController,Date,setTimeout,clearTimeout,console,
    fetch:async(url,opts)=>{calls.push({name:new URL(url).pathname.split('/').pop(),...opts});return fetcher(new URL(url),opts,calls.length);},
    self:{location:{href:'https://game.test/13/pack-sw.js?v=stream-fixture'},clients:{get:async()=>({postMessage(){}}),claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>{handlers[name]=fn;}}
  });
  vm.runInContext(template.replace('__PACK_CONFIG__',JSON.stringify(config)),context);
  return {stream:()=>context.streamPack({clientId:'fixture'}),calls,handlers,context};
}
function fixtureResponse(url,opts) {
  const full=url.pathname.endsWith('part1')?bytes.subarray(0,48):bytes.subarray(48);
  const offset=opts.headers.Range?Number(opts.headers.Range.match(/bytes=(\d+)/)[1]):0;
  return new Response(full.subarray(offset),{status:offset?206:200,headers:offset?{'Content-Range':'bytes '+offset+'-47/48'}:{}});
}
test('devolve cabecalhos e primeiro bloco sem aguardar o pacote inteiro',async()=>{
  let finishSecond;
  const gate=new Promise(resolve=>{finishSecond=resolve;});
  const w=worker(async(url,opts)=>{if(url.pathname.endsWith('part2'))await gate;return fixtureResponse(url,opts);});
  const response=w.stream();
  assert.equal(response.headers.get('Content-Length'),'96');
  const reader=response.body.getReader();
  const first=await reader.read();
  assert.deepEqual(first.value,bytes.subarray(0,48));
  finishSecond();
  const second=await reader.read();
  assert.deepEqual(second.value,bytes.subarray(48));
  assert.equal((await reader.read()).done,true);
});
test('ordem e conteudo exatos das partes',async()=>{
  const w=worker(async(url,opts)=>fixtureResponse(url,opts));
  assert.deepEqual(new Uint8Array(await w.stream().arrayBuffer()),bytes);
  assert.deepEqual(w.calls.map(x=>x.name),['part1','part2']);
});
test('recupera HTTP temporario antes do primeiro byte',async()=>{
  const w=worker(async(url,opts,count)=>count===1?new Response('',{status:503}):fixtureResponse(url,opts));
  assert.deepEqual(new Uint8Array(await w.stream().arrayBuffer()),bytes);
  assert.equal(w.calls.length,3);
});
for(const ignoreRange of [false,true]) test('retoma parte interrompida sem duplicar bytes; servidor ignora Range='+ignoreRange,async()=>{
  let cut=false;
  const w=worker(async(url,opts)=>{
    if(!cut){cut=true;let tick=0;return new Response(new ReadableStream({pull(c){if(tick++===0)c.enqueue(bytes.subarray(0,16));else c.error(new Error('rede interrompida'));}}));}
    if(ignoreRange&&opts.headers.Range)return new Response(bytes.subarray(0,48));
    return fixtureResponse(url,opts);
  });
  assert.deepEqual(new Uint8Array(await w.stream().arrayBuffer()),bytes);
  assert.equal(w.calls[1].headers.Range,'bytes=16-');
});
test('falha definitiva tem limite de tentativas e rejeita a leitura',async()=>{
  const w=worker(async()=>new Response('',{status:404}));
  await assert.rejects(w.stream().arrayBuffer());
  assert.equal(w.calls.length,3);
});
test('nao intercepta pacotes de outra campanha ou dominio',()=>{
  const w=worker(async(url,opts)=>fixtureResponse(url,opts));
  let intercepted=false;
  w.handlers.fetch({request:{url:'https://game.test/22/index.pck'},respondWith(){intercepted=true;}});
  assert.equal(intercepted,false);
  w.handlers.fetch({request:{url:'https://other.test/13/index.pck'},respondWith(){intercepted=true;}});
  assert.equal(intercepted,false);
});
