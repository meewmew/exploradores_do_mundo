import { mkdir, writeFile, readFile } from 'node:fs/promises';
const files=[
 ['aframe-MIT.txt','https://raw.githubusercontent.com/aframevr/aframe/v1.6.0/LICENSE'],
 ['ar-js-MIT.txt','https://raw.githubusercontent.com/AR-js-org/AR.js/3.4.7/LICENSE'],
 ['model-viewer-Apache-2.0.txt','https://raw.githubusercontent.com/google/model-viewer/v4.0.0/LICENSE'],
 ['jsQR-Apache-2.0.txt','https://unpkg.com/jsqr@1.4.0/LICENSE'],
 ['ARToolKit-LGPL-3.0.txt','https://raw.githubusercontent.com/artoolkit/ARToolKit5/master/LICENSE.txt'],
 ['three-MIT.txt','https://raw.githubusercontent.com/mrdoob/three.js/r180/LICENSE'],
];
await mkdir('public/vendor/licenses',{recursive:true});
for(const [file,url]of files){const r=await fetch(url);if(!r.ok)throw Error(`${url}: ${r.status}`);await writeFile(`public/vendor/licenses/${file}`,await r.text());console.log(file);}
for(const [name,file]of [['react','LICENSE'],['react-dom','LICENSE'],['react-router','LICENSE.md'],['react-router-dom','LICENSE.md'],['zod','LICENSE']])await writeFile(`public/vendor/licenses/${name}-MIT.txt`,await readFile(`node_modules/${name}/${file}`));
await writeFile('public/vendor/NOTICE.txt','Distribuições locais sem alteração. Fontes e versões: data-src/assets-manifest.json e SOURCES.md. AR.js inclui ARToolKit LGPL-3.0: código-fonte correspondente em https://github.com/AR-js-org/AR.js/tree/3.4.7 e https://github.com/artoolkit/ARToolKit5 . Este app não impede substituir as bibliotecas locais. A-Frame e Three.js: MIT. model-viewer e jsQR: Apache-2.0.\n');
