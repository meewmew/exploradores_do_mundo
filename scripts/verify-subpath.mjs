import { build } from 'vite';
import { readFile, access } from 'node:fs/promises';
await build({base:'/exploradores-do-mundo/',build:{outDir:'.cache/subpath-dist',emptyOutDir:true},logLevel:'warn'});
const html=await readFile('.cache/subpath-dist/index.html','utf8');
if(!html.includes('/exploradores-do-mundo/assets/'))throw Error('Prefixo de subpasta ausente no HTML.');
for(const file of ['ar/scene.html','ar/scene.js','ar/domain.js','vendor/aframe-1.6.0.min.js','vendor/ar-3.4.7.js','vendor/camera_para.dat','content/overrides.json','models/africa.glb','print/oceania-A4.pdf'])await access(`.cache/subpath-dist/${file}`);
console.log('Build em /exploradores-do-mundo/ com cena e assets locais: OK (sem execução em navegador).');
