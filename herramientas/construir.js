const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const salida = path.join(raiz, 'publicar');

// Solo se copia lo que el navegador necesita
const publicos = ['index.html', 'manifest.json', 'sw.js', 'css', 'js', 'data', 'img'];

fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida);

for (const item of publicos) {
  fs.cpSync(path.join(raiz, item), path.join(salida, item), { recursive: true });
}

console.log(`Build listo en ${salida}`);
