import { expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { arCountry, arSceneQuery, isARModelAllowed } from '../src/services/arTarget';
import { CONTINENT_IDS, type Continent } from '../src/types/continent';

it('cada país usa apenas seu GLB existente e o marcador de seu continente', async () => {
  for (const continentId of CONTINENT_IDS) {
    const continent: Continent = JSON.parse(await readFile(`src/data/continents/${continentId}.json`, 'utf8'));
    expect(isARModelAllowed(continentId, null, `models/${continentId}-terrain.glb`)).toBe(true);
    expect(isARModelAllowed(continentId, null, `models/${continentId}.glb`)).toBe(true);
    for (const country of continent.paises) {
      expect(arCountry(continentId, country.id)).toEqual({ nome: country.nome, file: country.modelo?.arquivo ?? null });
      expect(isARModelAllowed(continentId, country.id, country.modelo?.arquivo ?? null)).toBe(!!country.modelo);
      if (country.modelo) {
        await readFile(`public/${country.modelo.arquivo}`);
        const query = new URLSearchParams(arSceneQuery(continentId, country.modelo.arquivo, country.id));
        expect(query.get('continente')).toBe(continentId);
        expect(query.get('pais')).toBe(country.id);
        expect(query.get('model')).toBe(country.modelo.arquivo);
      }
    }
  }
});
it('rejeita país de outro continente, IDs inválidos, modelo trocado e caminhos arbitrários', () => {
  for (const [continent, country, model] of [
    ['africa','BRA','models/countries/BRA.glb'], ['america','BRA','models/countries/ARG.glb'],
    ['america','BRA','https://example.com/BRA.glb'], ['america','BRA','../models/countries/BRA.glb'],
    ['america','BRA','models/america-terrain.glb'], ['america',null,'models/countries/BRA.glb'],
    ['america','','models/america.glb'], ['europa','VAT',null], ['antartida','BRA','models/countries/BRA.glb'],
    ['invalido',null,'models/invalido.glb'], ['__proto__','BRA','models/countries/BRA.glb'],
    ['america','toString','models/countries/BRA.glb'],
  ]) expect(isARModelAllowed(continent, country, model)).toBe(false);
  expect(new URLSearchParams(arSceneQuery('africa','models/africa-terrain.glb')).has('pais')).toBe(false);
});
