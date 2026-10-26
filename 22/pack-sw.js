'use strict';
const BUILD_VERSION = '8ac3f86e5538';
const PARTS = ["index.pck.part01","index.pck.part02","index.pck.part03"];
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
if(!new URL(e.request.url).pathname.endsWith('/index.pck'))return;
e.respondWith((async()=>{
const data=await Promise.all(PARTS.map(async n=>{
const r=await fetch(new URL(n+'?v='+BUILD_VERSION,self.location.href),{cache:'reload'});if(!r.ok)throw Error(n+': '+r.status);return r.arrayBuffer();
}));return new Response(new Blob(data,{type:'application/octet-stream'}),{status:200,headers:{'Content-Type':'application/octet-stream','Cache-Control':'no-store'}});
})());});