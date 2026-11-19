// =========================================================
// CONSTRUIR.JS — Prepara la carpeta publicar/ que sube Netlify.
//
// 1. Copia solo lo que usa el navegador.
// 2. Completa sw.js: la versión de caché (un hash del contenido publicado,
//    así cambia sola cada vez que cambia algo) y la lista de archivos que
//    se guardan offline. Ya no hace falta mantener esa lista a mano.
// =========================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const raiz = path.join(__dirname, '..');
const salida = path.join(raiz, 'publicar');

// Solo se copia lo que el navegador necesita
const publicos = ['index.html', 'manifest.json', 'sw.js', 'css', 'js', 'data', 'img'];

fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida);

for (const item of publicos) {
  fs.cpSync(path.join(raiz, item), path.join(salida, item), { recursive: true });
}

// Lista recursiva de archivos publicados, en orden estable
function listar(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const rel = path.posix.join(base, entry.name);
      const abs = path.join(dir, entry.name);
      return entry.isDirectory() ? listar(abs, rel) : [rel];
    })
    .sort();
}

const archivos = listar(salida);

// sw.js no se incluye en su propia lista ni en el hash (se reescribe abajo)
const cacheables = archivos.filter((f) => f !== 'sw.js');

const hash = crypto.createHash('sha256');
for (const f of cacheables) {
  hash.update(f);
  hash.update(fs.readFileSync(path.join(salida, f)));
}
const version = hash.digest('hex').slice(0, 12);
const lista = ['./', ...cacheables.map((f) => `./${f}`)];

const swPath = path.join(salida, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
if (!sw.includes("'__VERSION__'") || !sw.includes('/*__ASSETS__*/[]')) {
  throw new Error('sw.js no tiene los marcadores __VERSION__ y __ASSETS__');
}
sw = sw
  .replace("'__VERSION__'", `'${version}'`)
  .replace('/*__ASSETS__*/[]', JSON.stringify(lista, null, 2));
fs.writeFileSync(swPath, sw);

console.log(`Build listo en ${salida}: versión de caché ${version}, ${lista.length} archivos offline`);
