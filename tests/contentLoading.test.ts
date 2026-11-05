import { afterEach, expect, it, vi } from 'vitest';
import { StaticContentRepository, applyOverrides, baseContinents } from '../src/services/contentRepository';

afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});

it('abre as fichas originais quando a requisição fica pendente e cancela a rede',async()=>{
 vi.useFakeTimers();
 let signal:AbortSignal|undefined;
 vi.stubGlobal('fetch',vi.fn((_url:string,options:RequestInit)=>{signal=options.signal as AbortSignal;return new Promise(()=>{});}));
 const loading=new StaticContentRepository().load();
 await vi.advanceTimersByTimeAsync(5000);
 const content=await loading;
 expect(content.continents).toEqual(baseContinents);
 expect(content.activities.length).toBeGreaterThan(0);
 expect(content.warning).toContain('usando as fichas originais');
 expect(signal?.aborted).toBe(true);
});

it('também limita a espera pelo corpo da resposta e limpa o timer após sucesso',async()=>{
 vi.useFakeTimers();
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:()=>new Promise(()=>{})}));
 const stalled=new StaticContentRepository().load();
 await vi.advanceTimersByTimeAsync(5000);
 expect((await stalled).warning).toContain('usando as fichas originais');

 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({version:1,continents:{},activities:[]})}));
 const content=await new StaticContentRepository().load();
 expect(content.warning).toBeUndefined();
 expect(vi.getTimerCount()).toBe(0);
});

it('edições parciais preservam a imagem da dica, os demais anos e links publicados',()=>{
 const africa=baseContinents.find(c=>c.id==='africa')!,country=africa.paises[0];
 const links=[{titulo:'Referência publicada',url:'https://example.org/fonte'}];
 const base=[{...africa,dicaQr:{texto:'Dica publicada',imagem:'images/guia-qr.svg'},
  variantesPorAno:{'1':{descricao:'Primeiro ano'},'2':{descricao:'Segundo ano'}},
  saibaMais:{texto:'Texto publicado',links},paises:[{...country,saibaMais:{texto:'País publicado',links}}],
 }];
 const before=structuredClone(base);
 const {continents}=applyOverrides(base,{version:1,continents:{africa:{fontes:['autoral'],
  dicaQr:{texto:'Nova dica'},variantesPorAno:{'1':{descricao:'Novo primeiro ano'}},saibaMais:{texto:'Novo texto'},
 }},countries:{[country.id]:{curiosidade:'Nova curiosidade',fontes:['autoral'],saibaMais:{texto:'Novo país'}}},activities:[]});
 expect(continents[0].dicaQr).toEqual({texto:'Nova dica',imagem:'images/guia-qr.svg'});
 expect(continents[0].variantesPorAno).toEqual({'1':{descricao:'Novo primeiro ano'},'2':{descricao:'Segundo ano'}});
 expect(continents[0].saibaMais).toEqual({texto:'Novo texto',links});
 expect(continents[0].paises[0].saibaMais).toEqual({texto:'Novo país',links});
 expect(base).toEqual(before);
});
