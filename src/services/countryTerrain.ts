import { z } from 'zod';
import { touristSpotSchema } from './contentSchema';
import type { Country, ContinentId } from '../types/continent';
import type { PositionedTouristSpot } from '../components/TouristPoints';
const pointSchema=touristSpotSchema.innerType().extend({posicao:z.tuple([z.number().finite(),z.number().finite(),z.number().finite()])});
const schema=z.object({version:z.literal(1),countryId:z.string().regex(/^[A-Z]{3}$/),continentId:z.string(),file:z.string(),verticalExaggeration:z.number().finite().positive(),sourceIds:z.array(z.string()).min(1),points:z.array(pointSchema).max(2)});
export interface CountryTerrainConfig {file:string;points:PositionedTouristSpot[];note:string}
export function parseCountryTerrain(value:unknown,country:Country,continentId:ContinentId):CountryTerrainConfig|null {
 const parsed=schema.safeParse(value);if(!parsed.success)return null;
 const m=parsed.data;
 if(m.countryId!==country.id||m.continentId!==continentId||m.file!==country.modelo?.arquivo)return null;
 if(new Set(m.points.map(p=>p.id)).size!==m.points.length)return null;
 for(const point of m.points){const known=country.pontosTuristicos?.find(p=>p.id===point.id);if(!known||known.nome!==point.nome||known.coordenadas.lat!==point.coordenadas.lat||known.coordenadas.lng!==point.coordenadas.lng)return null;}
 return {file:m.file,points:m.points,note:m.verticalExaggeration>1?'Relevo baseado em dados reais. As alturas foram ampliadas para destacar as formas do terreno.':'Relevo baseado em dados reais, simplificado para este modelo.'};
}
