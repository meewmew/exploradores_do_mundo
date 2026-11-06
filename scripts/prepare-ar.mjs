import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('public/styles', {recursive:true});
await copyFile('src/styles/tokens.css', 'public/styles/tokens.css');
const countries = {};
for (const id of ['africa','america','antartida','asia','europa','oceania']) {
 const continent = JSON.parse(await readFile(`src/data/continents/${id}.json`, 'utf8'));
 countries[id] = Object.fromEntries(continent.paises.map(country => [country.id, {nome: country.nome, file: country.modelo?.arquivo ?? null}]));
}
await writeFile('src/data/generated/ar-country-models.json', JSON.stringify(countries, null, 2) + '\n');
await build({entryPoints:['src/services/arStandalone.ts'],outfile:'public/ar/domain.js',bundle:true,platform:'browser',format:'esm',target:['chrome100','safari15.4'],minify:true});
