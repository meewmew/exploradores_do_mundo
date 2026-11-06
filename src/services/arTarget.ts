import countries from '../data/generated/ar-country-models.json';
import { CONTINENT_IDS } from '../types/continent';

const catalog: Record<string, Record<string, { nome: string; file: string | null }>> = countries;
export function arCountry(continentId: string, countryId: string) {
  const continent = Object.hasOwn(catalog, continentId) ? catalog[continentId] : undefined;
  return continent && Object.hasOwn(continent, countryId) ? continent[countryId] : undefined;
}
// Exact catalog matches keep scene URLs local and countries on their own continent.
export function isARModelAllowed(continentId: string | null, countryId: string | null, model: string | null): boolean {
  if (!CONTINENT_IDS.some(id => id === continentId)) return false;
  if (countryId !== null) {
    const country = arCountry(continentId!, countryId);
    return !!country?.file && country.file === model;
  }
  return model === `models/${continentId}.glb` || model === `models/${continentId}-terrain.glb`;
}
export function arSceneQuery(continentId: string, model: string, countryId?: string): string {
  const params = new URLSearchParams({ continente: continentId, model });
  if (countryId !== undefined) params.set('pais', countryId);
  return params.toString();
}
