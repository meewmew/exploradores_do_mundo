import { expect, it } from 'vitest';
import { receiveARMessage } from '../src/services/arBridge';

it('seleção de lugar só aceita mensagens da cena e do continente esperados',()=>{
 const source={} as Window,origin='https://example.org';
 const event={source,origin,data:{app:'exploradores-ar',version:1,type:'ar:point-selected',payload:{continentId:'africa',pointId:'piramides-gize'}}};
 expect(receiveARMessage(event as MessageEvent,source,origin,'africa')?.type).toBe('ar:point-selected');
 for(const payload of [{continentId:'asia',pointId:'piramides-gize'},{continentId:'africa',pointId:'<script>'},{continentId:'africa',pointId:3}]){
  expect(receiveARMessage({...event,data:{...event.data,payload}} as MessageEvent,source,origin,'africa')).toBeNull();
 }
 expect(receiveARMessage({...event,origin:'https://outro.org'} as MessageEvent,source,origin,'africa')).toBeNull();
 expect(receiveARMessage({...event,source:{}} as MessageEvent,source,origin,'africa')).toBeNull();
});
