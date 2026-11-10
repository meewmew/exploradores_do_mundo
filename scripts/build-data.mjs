import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { META, IMPLEMENTED_CONTINENTS } from './config.mjs';
import { editorial } from '../data-src/editorial.mjs';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
const geo = await json('data-src/geo/ne_50m_admin_0_countries.geojson');
const places = await json('data-src/geo/ne_50m_populated_places_simple.geojson');
const countryFacts = await json('data-src/country-facts.json');
const touristSpots = await json('data-src/tourist-spots.json');
if(touristSpots.version!==1||!touristSpots.continents||Object.entries(touristSpots.continents).some(([id,points])=>!IMPLEMENTED_CONTINENTS.includes(id)||!Array.isArray(points)||points.length>(id==='africa'?3:5)))throw new Error('Pontos turísticos inválidos: piloto África limitado a três locais.');
const countryModelFiles=new Set(await readdir('public/models/countries').catch(error=>{if(error.code==='ENOENT')return [];throw error;}));
const html = await readFile('data-src/un-members.html', 'utf8');
const clean = text => text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
const names = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(x => clean(x[1])).filter(x=>x && x !== 'Search the United Nations');
const normalize = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z]/g, '');
const aliases = {
  'Bahamas (The)': 'BHS', 'Brunei Darussalam': 'BRN', 'Bolivia (Plurinational State of)': 'BOL',
  "China (the People's Republic of)": 'CHN', 'Congo': 'COG', "Côte D'Ivoire": 'CIV', 'Czechia': 'CZE',
  "Democratic People's Republic of Korea": 'PRK', 'Gambia (Republic of The)': 'GMB', 'Guinea Bissau': 'GNB',
  'Iran (Islamic Republic of)': 'IRN', 'Lao People’s Democratic Republic': 'LAO',
  'Micronesia (Federated States of)': 'FSM', 'Naoero': 'NRU', 'Netherlands (Kingdom of the)': 'NLD',
  'Republic of Korea': 'KOR', 'Republic of Moldova': 'MDA', 'Russian Federation': 'RUS',
  'United Kingdom of Great Britain and Northern Ireland': 'GBR', 'United Republic of Tanzania': 'TZA',
  'Venezuela, Bolivarian Republic of': 'VEN', 'Viet Nam': 'VNM', 'Timor-Leste': 'TLS', 'Cabo Verde': 'CPV',
  'Türkiye': 'TUR', 'Türkiye (Republic of)': 'TUR',
};
const unmatched = [];
const memberCodes = names.map(name => {
  const match = geo.features.find(f => ['NAME_EN', 'ADMIN', 'FORMAL_EN', 'NAME_LONG'].some(k => f.properties[k] && normalize(f.properties[k]) === normalize(name)));
  const code = aliases[name] || match?.properties.ADM0_A3;
  if (!code) unmatched.push(name);
  return code;
});
if (memberCodes.length !== 193 || unmatched.length || new Set(memberCodes).size !== 193) {
  throw new Error(`ONU: ${names.length} entradas, ${new Set(memberCodes).size} códigos; sem correspondência: ${JSON.stringify(unmatched)}`);
}
const observers = await readFile('data-src/un-observers.html', 'utf8');
if (!/Holy See/i.test(observers) || !/Palestine/i.test(observers)) throw new Error('Revalidar observadores ONU.');
const sovereigns = new Set([...memberCodes, 'VAT', 'PSX']);
await writeFile('data-src/un-sovereign-codes.json', JSON.stringify([...sovereigns].sort(), null, 2) + '\n');
const byContinent = { Africa:'africa', 'North America':'america', 'South America':'america', Antarctica:'antartida', Asia:'asia', Europe:'europa', Oceania:'oceania' };
const overrides = { RUS:'asia', TUR:'asia', KAZ:'asia', GEO:'asia', ARM:'asia', AZE:'asia', CYP:'asia', EGY:'africa', SYC:'africa', MUS:'africa', MDV:'asia', SHN:'africa', IOT:'asia', SGS:'antartida', ATF:'antartida', HMD:'antartida' };
const transcontinental = {
  RUS:'A Rússia se estende pela Europa e pela Ásia; fica na Ásia nesta coleção pela maior parte do território.',
  TUR:'A Turquia tem terras na Europa e na Ásia; a maior parte fica na Ásia.',
  KAZ:'O Cazaquistão tem terras na Europa e na Ásia; a maior parte fica na Ásia.',
  EGY:'O Egito inclui a Península do Sinai, na Ásia; a maior parte de seu território fica na África.',
  GEO:'O limite entre Europa e Ásia no Cáucaso varia por convenção; esta coleção adota a Geórgia na Ásia.',
  AZE:'O limite entre Europa e Ásia no Cáucaso varia por convenção; esta coleção adota o Azerbaijão na Ásia.',
  ARM:'Esta coleção adota a Armênia na Ásia, conforme a região geográfica do Natural Earth.',
  IDN:'A Indonésia tem ilhas dos dois lados do limite convencional Ásia/Oceania; a maior parte do território fica na Ásia.',
};
const mapping = Object.fromEntries(geo.features.map(f => [f.properties.ADM0_A3, overrides[f.properties.ADM0_A3] || byContinent[f.properties.CONTINENT] || 'antartida']));
// O arquivo é versionado e passa a ser entrada explícita do pipeline de modelos.
await writeFile('data-src/country-continent.json', JSON.stringify(mapping, null, 2) + '\n');
const missing = { valor:null, fonte:'natural-earth', verificar:true };
const region = p => ({ 'South America':'América do Sul', 'Central America':'América Central', Caribbean:'Caribe' })[p.SUBREGION] || 'América do Norte';
function country(f, continentId) {
  const p = f.properties;
  const capitals = places.features.filter(x => Number(x.properties.adm0cap) === 1 && x.properties.adm0_a3 === p.ADM0_A3).map(x => x.properties.name);
  return {
    id:p.ADM0_A3, nome:p.NAME_PT || p.NAME_EN, nomeFonte:'natural-earth',
    ...(!countryFacts[p.ADM0_A3]?.capital&&capitals.length ? { capital:{ valor:[...new Set(capitals)].join(' / '), fonte:'natural-earth' } } : {}),
    populacao: p.POP_EST > 0 && p.POP_YEAR > 0 ? { valor:p.POP_EST, fonte:'natural-earth', anoReferencia:p.POP_YEAR } : { ...missing, anoReferencia:0 },
    areaKm2:{ ...missing },
    curiosidade:`No mapa desta coleção, ${p.NAME_PT || p.NAME_EN} faz parte de ${META[continentId].nome}.`,
    fontes:['natural-earth', 'country-assignments', ...(countryFacts[p.ADM0_A3]?.capital ? [countryFacts[p.ADM0_A3].capital.fonte] : []), ...(sovereigns.has(p.ADM0_A3)?[p.ADM0_A3==='VAT'||p.ADM0_A3==='PSX'?'un-observers':'un-members']:[])],
    ...(transcontinental[p.ADM0_A3] ? { nota:transcontinental[p.ADM0_A3] } : {}),
    ...(contintentRegion(continentId) ? { regiao:region(p) } : {}),
    ...(sovereigns.has(p.ADM0_A3)&&countryModelFiles.has(`${p.ADM0_A3}.glb`)?{modelo:{ arquivo:`models/countries/${p.ADM0_A3}.glb` }}:{}),
    ...(countryFacts[p.ADM0_A3]?.capital?{capital:countryFacts[p.ADM0_A3].capital}:{}),
  };
}
function contintentRegion(id) { return id === 'america'; }
await mkdir('src/data/continents', {recursive:true});
// A arte autoral em public/images é versionada e revisada separadamente dos dados.
for (const id of IMPLEMENTED_CONTINENTS) {
  const e = editorial[id];
  const features = geo.features.filter(f => mapping[f.properties.ADM0_A3] === id && f.properties.ADM0_A3 !== 'ATA');
  const paises = id === 'antartida' ? [] : features.filter(f => sovereigns.has(f.properties.ADM0_A3)).map(f=>country(f,id)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
  const territorios = id === 'antartida' ? [] : features.filter(f => !sovereigns.has(f.properties.ADM0_A3)).map(f=>({...country(f,id), nota:'Território, dependência ou área com status próprio/disputado; fora da contagem de Estados da ONU.'})).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
  const fontesTexto = Object.fromEntries(['descricao','caracteristicasGeograficas','climas','faunaFlora','cultura','curiosidades'].map(field=>[field,[e.fonte, ...(id==='antartida'?['antarctic-treaty']:[])]]));
  const modelStat=await stat(`public/models/${id}.glb`).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  const data = {
    id, nome:META[id].nome, cor:META[id].cor, descricaoCurta:e.descricao, descricao:e.descricao,
    fichaCurta:{localizacao:e.localizacao,curiosidade:e.curiosidade,ilustracao:`images/${id}.svg`,ilustracaoAlt:`Ilustração educativa de ${META[id].nome}: ${e.curiosidade}`},
    areaKm2:{...missing}, populacao:{...missing,anoReferencia:0},
    quantidadePaises:{valor:paises.length,fonte:'country-assignments',criterio:'Estados-membros da ONU e observadores; país no continente da maior parte do território, Cáucaso na Ásia.'},
    caracteristicasGeograficas:e.caracteristicasGeograficas, climas:e.climas, faunaFlora:e.faunaFlora,cultura:e.cultura,curiosidades:[e.curiosidade],
    paises,territorios,fontesTexto,marcador:{tipo:'barcode',id:Object.keys(META).indexOf(id),arquivo:`markers/${id}-ar.svg`},modelo:{arquivo:`models/${id}.glb`,...(modelStat?{tamanhoKb:Number((modelStat.size/1024).toFixed(2))}:{})},
    ...(touristSpots.continents[id]?.length?{pontosTuristicos:touristSpots.continents[id]}:{}),
    dicaQr:{texto:`Procure a folha com o título “${META[id].nome}”, preparada pelo professor. O QR fica ao lado do quadrado preto.`,imagem:'images/guia-qr.svg'},
    saibaMais:{texto:id==='america'?'Usamos o modelo de seis continentes, com a América unificada. Outros livros usam sete e separam América do Norte e América do Sul.':e.descricao,links:[{titulo:'Consultar a fonte',url: id==='antartida'?'https://www.ats.aq/e/antarctictreaty.html':`https://education.nationalgeographic.org/resource/${({africa:'africa-physical-geography',asia:'asia',europa:'europe-physical-geography',oceania:'oceania-physical-geography',america:'Continent'})[id]}/`}]},
  };
  await writeFile(`src/data/continents/${id}.json`, JSON.stringify(data,null,2)+'\n');
  console.log(`${id}: ${paises.length} países; ${territorios.length} territórios/áreas`);
}
