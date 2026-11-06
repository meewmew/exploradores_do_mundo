export const CONTINENT_IDS = ['africa','america','antartida','asia','europa','oceania'] as const;
export type ContinentId = typeof CONTINENT_IDS[number];
export const SCHOOL_YEARS = ['geral','1','2','3','4','5','6','7','8','9'] as const;
export type SchoolYear = typeof SCHOOL_YEARS[number];
export interface Sourced<T> { valor:T|null; fonte:string; verificar?:boolean }
export interface Country {
  id:string; nome:string; nomeFonte:string; capital?:Sourced<string>;
  populacao:Sourced<number>&{anoReferencia:number}; areaKm2:Sourced<number>;
  curiosidade:string; fontes:string[]; nota?:string; regiao?:string;
  pontosTuristicos?:TouristSpot[]; modelo?:{arquivo:string}; audioUrl?:string; saibaMais?:{texto:string;links?:{titulo:string;url:string}[]};
}
export interface TouristSpot {
  id:string;nome:string;descricaoCurta:string;
  coordenadas:{lat:number;lng:number};
  fontes:string[];
  fontesPorCampo?:{nome:string[];descricaoCurta:string[];coordenadas:string[]};
  imagemUrl?:string; saibaMaisUrl?:string;
}
export interface Continent {
  id:ContinentId;nome:string;cor:string;descricaoCurta:string;descricao:string;
  fichaCurta:{localizacao:string;curiosidade:string;ilustracao:string;ilustracaoAlt:string};
  areaKm2:Sourced<number>;populacao:Sourced<number>&{anoReferencia:number};quantidadePaises:Sourced<number>&{criterio:string};
  caracteristicasGeograficas:string[];climas:string[];faunaFlora:string[];cultura:string[];curiosidades:string[];
  paises:Country[];territorios:Country[];
  marcador:{tipo:'barcode'|'pattern';id:number|string;arquivo:string};modelo:{arquivo:string;tamanhoKb?:number};
  fontesTexto:Partial<Record<'descricao'|'caracteristicasGeograficas'|'climas'|'faunaFlora'|'cultura'|'curiosidades',string[]>>;
  fontes?:string[];
  pontosTuristicos?:TouristSpot[];
  dicaQr?:{texto:string;imagem?:string};audioUrl?:string;saibaMais?:{texto:string;links?:{titulo:string;url:string}[]};
  variantesPorAno?:Partial<Record<SchoolYear,{descricao:string}>>;
}
export interface Activity {
 id:string;continentId:ContinentId;anosEscolares:SchoolYear[];
 tipo:'multipla-escolha'|'reconhecer-formato'|'localizar-no-mapa';
 enunciado:string;opcoes:{id:string;texto:string;silhueta?:string}[];respostaCorretaId:string;dica:string;explicacao:string;fontes?:string[];
}
