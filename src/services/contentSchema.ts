import { z } from 'zod';
import { CONTINENT_IDS, SCHOOL_YEARS } from '../types/continent';
const sourced=z.object({valor:z.number().nonnegative().nullable(),fonte:z.string().min(1),verificar:z.boolean().optional()}).passthrough().refine(s=>s.valor!==null||s.verificar===true,'null exige verificar');
const localPath=z.string().regex(/^(?:images|models|markers|media)\/[a-zA-Z0-9_./-]+$/).refine(s=>!s.includes('..'),'Caminho local inválido');
const links=z.array(z.object({titulo:z.string().min(1),url:z.string().url().refine(s=>s.startsWith('https://'))})).max(20);
const more=z.object({texto:z.string().max(5000),links:links.optional()});
const sourceList=z.array(z.string().min(1)).min(1);
export const touristSpotSchema=z.object({
 id:z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),nome:z.string().min(1).max(120),descricaoCurta:z.string().min(1).max(140),
 coordenadas:z.object({lat:z.number().finite().min(-90).max(90),lng:z.number().finite().min(-180).max(180)}).strict(),
 fontes:sourceList,fontesPorCampo:z.object({nome:sourceList,descricaoCurta:sourceList,coordenadas:sourceList}).strict().optional(),imagemUrl:localPath.optional(),
}).strict().refine(point=>!point.fontesPorCampo||Object.values(point.fontesPorCampo).flat().every(source=>point.fontes.includes(source)),'Fontes por campo devem constar na lista de fontes');
const touristSpots=z.array(touristSpotSchema).max(5).refine(points=>new Set(points.map(point=>point.id)).size===points.length,'IDs de pontos turísticos devem ser únicos');
export const continentSchema=z.object({
 id:z.enum(CONTINENT_IDS),nome:z.string().min(1),cor:z.string().regex(/^#[0-9a-f]{6}$/i),descricaoCurta:z.string().max(220),descricao:z.string().min(1),
 fichaCurta:z.object({localizacao:z.string().min(1).max(140),curiosidade:z.string().min(1).max(140),ilustracao:localPath,ilustracaoAlt:z.string().min(1)}),
 areaKm2:sourced,populacao:sourced,quantidadePaises:sourced,
 caracteristicasGeograficas:z.array(z.string()),climas:z.array(z.string()),faunaFlora:z.array(z.string()),cultura:z.array(z.string()),curiosidades:z.array(z.string()),
 paises:z.array(z.object({id:z.string(),nome:z.string(),fontes:z.array(z.string()).min(1),areaKm2:sourced,populacao:sourced}).passthrough()),territorios:z.array(z.object({id:z.string(),nome:z.string()}).passthrough()),
 marcador:z.object({tipo:z.enum(['barcode','pattern']),id:z.union([z.string(),z.number()]),arquivo:localPath}),modelo:z.object({arquivo:localPath,tamanhoKb:z.number().optional()}),
 fontesTexto:z.record(z.array(z.string()).min(1)),pontosTuristicos:touristSpots.optional(),
}).passthrough().refine(c=>c.id!=='antartida'||c.paises.length===0,'Antártida não tem lista de países');
export const activitySchema=z.object({
 id:z.string().regex(/^[a-z0-9-]{1,100}$/),continentId:z.enum(CONTINENT_IDS),anosEscolares:z.array(z.enum(SCHOOL_YEARS)).min(1),tipo:z.enum(['multipla-escolha','reconhecer-formato','localizar-no-mapa']),enunciado:z.string().min(1).max(500),
 opcoes:z.array(z.object({id:z.string().min(1),texto:z.string().min(1).max(300),silhueta:localPath.optional()})).max(8),respostaCorretaId:z.string().min(1),dica:z.string().min(1).max(500),explicacao:z.string().min(1).max(1000),fontes:z.array(z.string()).min(1),
}).strict().superRefine((a,ctx)=>{
 if(!a.id.startsWith(`${a.continentId}-`))ctx.addIssue({code:'custom',message:'ID deve começar pelo continente'});
 if(a.tipo==='localizar-no-mapa'?(a.opcoes.length!==0||!(CONTINENT_IDS as readonly string[]).includes(a.respostaCorretaId)):(a.opcoes.length<2||!a.opcoes.some(o=>o.id===a.respostaCorretaId)||new Set(a.opcoes.map(o=>o.id)).size!==a.opcoes.length))ctx.addIssue({code:'custom',message:'Resposta/opções inválidas'});
});
const media=z.string().regex(/^media\/[a-zA-Z0-9_./-]+$/).refine(s=>!s.includes('..'));
const patch=z.object({
 descricao:z.string().min(1).max(2000).optional(),
 fichaCurta:z.object({localizacao:z.string().min(1).max(140),curiosidade:z.string().min(1).max(140),ilustracao:media.optional(),ilustracaoAlt:z.string().min(1)}).optional(),
 dicaQr:z.object({texto:z.string().min(1).max(600),imagem:media.optional()}).optional(),
 audioUrl:media.optional(),saibaMais:more.optional(),
 variantesPorAno:z.record(z.enum(SCHOOL_YEARS),z.object({descricao:z.string().min(1).max(2000)})).optional(),
 fontes:z.array(z.string().min(1)).min(1),
}).strict();
const countryPatch=z.object({curiosidade:z.string().min(1).max(300),audioUrl:media.optional(),saibaMais:more.optional(),fontes:z.array(z.string()).min(1)}).strict();
export const overridesSchema=z.object({version:z.literal(1),continents:z.record(z.enum(CONTINENT_IDS),patch),countries:z.record(z.string().regex(/^[A-Z]{3}$/),countryPatch).optional(),activities:z.array(activitySchema)}).strict();
export type ContentOverrides=z.infer<typeof overridesSchema>;
export function validateOverrides(value:unknown,sourceIds:string[]):ContentOverrides|null{
 const result=overridesSchema.safeParse(value);if(!result.success)return null;
 const o=result.data;const refs=[...Object.values(o.continents).flatMap(c=>c.fontes),...Object.values(o.countries||{}).flatMap(c=>c.fontes),...o.activities.flatMap(a=>a.fontes||[])];
 if(refs.some(id=>!sourceIds.includes(id))||new Set(o.activities.map(a=>a.id)).size!==o.activities.length)return null;
 return o;
}
