const appNames = ['app-v3.part1', 'app-v3.part2', 'app-v3.part3', 'app-v3.part4'];
const [chunks, catalogText, firebaseText] = await Promise.all([
  Promise.all(appNames.map(async (name)=>{ const r=await fetch(name,{cache:"no-store"}); if(!r.ok) throw new Error(`No se pudo cargar ${name}`); return r.text(); })),
  fetch("catalog-v3.js",{cache:"no-store"}).then(r=>{if(!r.ok) throw new Error("No se pudo cargar catalog-v3.js"); return r.text();}),
  fetch("firebase-sync.js",{cache:"no-store"}).then(r=>{if(!r.ok) throw new Error("No se pudo cargar firebase-sync.js"); return r.text();})
]);
const catalogUrl=URL.createObjectURL(new Blob([catalogText],{type:"text/javascript"}));
const firebaseUrl=URL.createObjectURL(new Blob([firebaseText],{type:"text/javascript"}));
let code=chunks.join("");
code=code.replaceAll('"./catalog.js"',JSON.stringify(catalogUrl));
code=code.replaceAll('"./firebase-sync.js"',JSON.stringify(firebaseUrl));
const appUrl=URL.createObjectURL(new Blob([code],{type:"text/javascript"}));
try { await import(appUrl); } catch (error) {
  document.body.innerHTML=`<main style="max-width:720px;margin:60px auto;font-family:Segoe UI,Arial;padding:24px"><h1>No fue posible abrir la aplicación</h1><pre style="white-space:pre-wrap">${error?.stack||error}</pre></main>`;
  console.error(error);
}
