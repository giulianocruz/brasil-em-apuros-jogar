#!/usr/bin/env node
/**
 * Auditoria estática do pacote público de Brasil em Apuros!
 * Uso: node tools/verificar-publicacao.mjs [--rapido]
 * Sem dependências, rede ou acesso a credenciais.
 */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rapido = process.argv.includes('--rapido');
let falhas = 0;
let ok = 0;

function reportar(valido, mensagem) {
  console.log((valido ? 'OK   ' : 'ERRO ') + mensagem);
  if (valido) ok += 1;
  else falhas += 1;
}

async function ler(relativo) {
  return readFile(path.join(raiz, relativo), 'utf8');
}

async function existe(relativo) {
  try { return await stat(path.join(raiz, relativo)); }
  catch { return null; }
}

async function verificarReferencias(relativo) {
  const texto = await ler(relativo);
  const referencias = new Set();
  for (const match of texto.matchAll(/(?:src|href)=["'](\.[^"']+)["']/g)) referencias.add(match[1]);
  for (const match of texto.matchAll(/url\(["']?(\.[^)'" ]+)["']?\)/g)) referencias.add(match[1]);
  for (const ref of referencias) {
    const limpo = ref.split(/[?#]/, 1)[0];
    if (!limpo) continue;
    const resolvido = path.resolve(raiz, path.dirname(relativo), limpo);
    if (!(resolvido === raiz || resolvido.startsWith(raiz + path.sep))) {
      reportar(false, relativo + ': referência fora do projeto ' + ref);
      continue;
    }
    reportar(Boolean(await existe(path.relative(raiz, resolvido))), relativo + ' → ' + ref);
  }
}

async function hashPartes(pasta, partes) {
  const hash = createHash('sha256');
  for (const parte of partes) {
    const arquivo = path.join(raiz, pasta, parte);
    for await (const chunk of createReadStream(arquivo)) hash.update(chunk);
  }
  return hash.digest('hex');
}

async function verificarEdicao(numero) {
  const pasta = String(numero);
  let manifesto;
  try { manifesto = JSON.parse(await ler(pasta + '/pack-manifest.json')); }
  catch (erro) { reportar(false, pasta + ': manifesto inválido: ' + erro.message); return; }

  const html = await ler(pasta + '/index.html');
  const carregador = await ler(pasta + '/pack-sw.js');
  const esperado = Number(manifesto.size);
  const partes = manifesto.parts;
  reportar(Number.isSafeInteger(esperado) && esperado > 0, pasta + ': tamanho do pacote válido');
  reportar(Array.isArray(partes) && partes.length > 0 && partes.every(p => /^index\.pck\.part\d{2}$/.test(p)), pasta + ': lista segura de segmentos');
  if (!Array.isArray(partes) || !partes.length || partes.some(p => !/^index\.pck\.part\d{2}$/.test(p))) return;

  let total = 0;
  let faltando = false;
  for (const parte of partes) {
    const info = await existe(pasta + '/' + parte);
    reportar(Boolean(info?.isFile() && info.size > 0), pasta + ': ' + parte + ' existe');
    if (info?.isFile()) total += info.size;
    else faltando = true;
    reportar(carregador.includes(parte), pasta + ': Service Worker carrega ' + parte);
  }
  reportar(!faltando && total === esperado, pasta + ': soma dos segmentos = ' + esperado + ' bytes');
  reportar(html.includes('"index.pck":' + esperado), pasta + ': configuração Godot usa o mesmo tamanho');
  reportar(html.includes('prepareSplitPack()'), pasta + ': pré-carregamento do Service Worker habilitado');
  const wasm = await existe(pasta + '/index.wasm');
  reportar(Boolean(wasm?.isFile() && wasm.size > 0), pasta + ': WebAssembly existente');

  if (!rapido && !faltando && total === esperado) {
    const hash = await hashPartes(pasta, partes);
    reportar(hash === manifesto.sha256, pasta + ': SHA-256 do pacote Web íntegro');
  }
}

try {
  for (const arquivo of ['index.html', 'urna.html', 'premium.css', 'premium.js', 'urna.css', 'urna.js']) {
    reportar(Boolean(await existe(arquivo)), arquivo + ' presente');
  }
  const principal = await ler('index.html');
  const urna = await ler('urna.html');
  const logica = await ler('urna.js');
  reportar(principal.includes('href="./urna.html"'), 'portal aponta para a urna');
  reportar(urna.includes('data-edicao="13"') && urna.includes('data-edicao="22"'), 'urna oferece as duas edições');
  reportar(logica.includes("'13': './13/'") && logica.includes("'22': './22/'"), 'confirmação navega para ambos os jogos');
  reportar(logica.includes('window.location.assign') && !/localStorage|sessionStorage|sendBeacon|fetch\(/.test(logica), 'seletor não grava ou transmite escolhas');
  for (const arquivo of ['index.html', 'urna.html', 'premium.css', 'urna.css']) await verificarReferencias(arquivo);
  for (const numero of [13, 22]) await verificarEdicao(numero);
} catch (erro) {
  reportar(false, 'Exceção na auditoria: ' + (erro.stack || erro.message));
}
console.log('\nResultado: ' + ok + ' verificações OK; ' + falhas + ' falha(s).' + (rapido ? ' (sem checagem SHA-256)' : ''));
if (falhas > 0) process.exitCode = 1;
