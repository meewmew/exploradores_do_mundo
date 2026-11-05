import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('public/styles', {recursive:true});
await copyFile('src/styles/tokens.css', 'public/styles/tokens.css');
await build({entryPoints:['src/services/arStandalone.ts'],outfile:'public/ar/domain.js',bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true});
