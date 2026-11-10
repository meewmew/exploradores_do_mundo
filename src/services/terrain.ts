import { z } from 'zod';
import type { Continent } from '../types/continent';
import { touristSpotSchema } from './contentSchema';
import type { PositionedTouristSpot } from '../components/TouristPoints';

const modules = import.meta.glob('../data/generated/*-terrain.json', { eager: true, import: 'default' });
const position = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]);
const metadataSchema = z.object({
  continentId: z.enum(['africa','america','antartida','asia','europa','oceania']),
  file: z.string().regex(/^models\/[a-z]+-terrain\.glb$/), sourceIds: z.array(z.string().min(1)).min(1),
  verticalExaggeration: z.number().finite().positive(),
  points: z.array(z.object({ posicao: position }).passthrough()).length(3),
});
const metadataByContinent = new Map(Object.values(modules).flatMap(value => {
  const parsed = metadataSchema.safeParse(value);
  return parsed.success && parsed.data.file === `models/${parsed.data.continentId}-terrain.glb`
    ? [[parsed.data.continentId, parsed.data] as const]
    : [];
}));

export function getTerrainConfig(continent: Continent): { file: string; points: PositionedTouristSpot[]; note?: string } {
  const fallback = { file: continent.modelo.arquivo, points: [] };
  const metadata = metadataByContinent.get(continent.id);
  if (!metadata) return fallback;
  const points: PositionedTouristSpot[] = [];
  for (const candidate of metadata.points) {
    const { posicao, ...fields } = candidate;
    const point = touristSpotSchema.safeParse(fields);
    if (!point.success || !continent.pontosTuristicos?.some(item => item.id === point.data.id)) return fallback;
    points.push({ ...point.data, posicao });
  }
  return { file: metadata.file, points, note: 'Relevo baseado em dados reais. As alturas foram ampliadas para destacar as formas do terreno.' };
}
