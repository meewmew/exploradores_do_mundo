import { readFile, access, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { renderSourcesPage } from './sources-page.mjs';
import { IMPLEMENTED_CONTINENTS, KNOWN_CONTINENTS } from './config.mjs';
import { build } from 'esbuild';
const bundle=await build({entryPoints:['src/services/contentSchema.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {continentSchema,validateOverrides}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const sources=await readFile('SOURCES.md','utf8');const ids=[...sources.matchAll(/^## \[([^\]]+)\]/gm)].map(m=>m[1]);
for(const id of IMPLEMENTED_CONTINENTS){
 const c=JSON.parse(await readFile(`src/data/continents/${id}.json`,'utf8'));continentSchema.parse(c);
 for(const field of ['descricao','caracteristicasGeograficas','climas','faunaFlora','cultura','curiosidades'])if(!c.fontesTexto[field]?.length||c.fontesTexto[field].some(x=>!ids.includes(x)))throw new Error(`Fonte textual inválida: ${id}.${field}`);
 for(const n of [c.areaKm2,c.populacao,c.quantidadePaises,...c.paises.flatMap(p=>[p.areaKm2,p.populacao])])if(!ids.includes(n.fonte))throw new Error(`Fonte numérica inválida: ${id}`);
 for(const point of [...(c.pontosTuristicos||[]),...c.paises.flatMap(country=>country.pontosTuristicos||[])]){if(point.fontes.some(source=>!ids.includes(source)))throw new Error(`Fonte de ponto turístico inválida: ${id}.${point.id}`);if(point.imagemUrl)await access(`public/${point.imagemUrl}`);}
 for(const file of [c.modelo.arquivo,c.fichaCurta.ilustracao,c.marcador.arquivo,...c.paises.filter(p=>p.modelo).map(p=>p.modelo.arquivo)])await access(`public/${file}`);
 if(c.id==='america'&&c.paises.some(p=>!p.regiao))throw new Error('País da América sem região.');
}
try{const o=JSON.parse(await readFile('public/content/overrides.json','utf8'));if(!validateOverrides(o,ids))throw new Error('Overrides inválidos: não publicar.');const inspect=async value=>{if(typeof value==='string'&&value.startsWith('media/'))await access(`public/${value}`);else if(Array.isArray(value))for(const item of value)await inspect(item);else if(value&&typeof value==='object')for(const item of Object.values(value))await inspect(item);};await inspect(o);}catch(e){if(e.code==='ENOENT'&&e.path==='public/content/overrides.json'){}else throw e;}
await mkdir('public/content',{recursive:true});
await writeFile('public/content/continents.json',JSON.stringify(IMPLEMENTED_CONTINENTS));
await mkdir('public/licenses',{recursive:true});
await copyFile('LICENSE','public/licenses/projeto-MIT.txt');
await writeFile('public/fontes.html',renderSourcesPage(sources));
if(new Set(KNOWN_CONTINENTS).size!==6)throw new Error('Exigir seis IDs conhecidos.');
console.log(`Conteúdo, fontes e arquivos de ${IMPLEMENTED_CONTINENTS.length} continente(s) validados.`);
