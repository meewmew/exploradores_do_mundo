import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { continentSchema, touristSpotSchema } from '../src/services/contentSchema';
import { CONTINENT_IDS } from '../src/types/continent';
import source from '../data-src/tourist-spots.json';

it('cada continente tem três lugares com fontes cadastradas e dados válidos', async () => {
  const sources = await readFile('SOURCES.md', 'utf8');
  const sourceIds = new Set([...sources.matchAll(/^## \[([^\]]+)\]/gm)].map(match => match[1]));
  expect(Object.keys(source.continents).sort()).toEqual([...CONTINENT_IDS].sort());
  for (const id of CONTINENT_IDS) {
    const spots = source.continents[id];
    const continent = JSON.parse(await readFile(`src/data/continents/${id}.json`, 'utf8'));
    expect(spots).toHaveLength(3);
    expect(continent.pontosTuristicos).toEqual(spots);
    expect(continentSchema.safeParse(continent).success).toBe(true);
    expect(new Set(spots.map(point => point.id)).size).toBe(3);
    for (const point of spots) {
      expect(touristSpotSchema.safeParse(point).success).toBe(true);
      expect(point.fontes.length).toBeGreaterThan(0);
      for (const sourceId of point.fontes) expect(sourceIds.has(sourceId), `${id}.${point.id}: ${sourceId}`).toBe(true);
      expect(point.coordenadas.lat).toBeGreaterThanOrEqual(-90);
      expect(point.coordenadas.lat).toBeLessThanOrEqual(90);
      expect(point.coordenadas.lng).toBeGreaterThanOrEqual(-180);
      expect(point.coordenadas.lng).toBeLessThanOrEqual(180);
      expect(point.descricaoCurta.length).toBeLessThanOrEqual(140);
    }
  }
  expect(source.continents.antartida.every(point => point.nome.startsWith('Estação'))).toBe(true);
});

it('rejeita coordenadas inválidas, fontes ausentes, IDs duplicados e mais de cinco pontos', async () => {
  const point = source.continents.africa[0];
  for (const coordenadas of [{ lat: 91, lng: 31 }, { lat: 30, lng: -181 }, { lat: Number.NaN, lng: 31 }, { lat: 30, lng: Number.POSITIVE_INFINITY }]) {
    expect(touristSpotSchema.safeParse({ ...point, coordenadas }).success).toBe(false);
  }
  expect(touristSpotSchema.safeParse({ ...point, fontes: [] }).success).toBe(false);
  expect(touristSpotSchema.safeParse({ ...point, fontes: ['unesco-giza'] }).success).toBe(false);
  expect(touristSpotSchema.safeParse({ ...point, descricaoCurta: 'a'.repeat(141) }).success).toBe(false);
  const continent = JSON.parse(await readFile('src/data/continents/africa.json', 'utf8'));
  expect(continentSchema.safeParse({ ...continent, pontosTuristicos: [point, point] }).success).toBe(false);
  const six = Array.from({ length: 6 }, (_, index) => ({ ...point, id: `local-${index}` }));
  expect(continentSchema.safeParse({ ...continent, pontosTuristicos: six }).success).toBe(false);
});
