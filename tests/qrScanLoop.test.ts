import { describe, expect, it, vi } from 'vitest';
import { startQRScanLoop } from '../src/services/qrScanLoop';

function frames(){
 let next=0;
 const pending=new Map<number,FrameRequestCallback>();
 return {
  request(callback:FrameRequestCallback){const handle=++next;pending.set(handle,callback);return handle;},
  cancel(handle:number){pending.delete(handle);},
  tick(now:number){const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(now));},
  pending:()=>pending.size,
 };
}

describe('Leitura de QR por quadros',()=>{
 it('encerra o loop e informa falha de processamento para permitir nova tentativa',()=>{
  const scheduler=frames(),failure=new Error('Falha ao processar a câmera'),onError=vi.fn(),onCode=vi.fn();
  startQRScanLoop(()=>{throw failure;},onCode,onError,scheduler);
  scheduler.tick(160);scheduler.tick(320);
  expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
  expect(onCode).not.toHaveBeenCalled();expect(scheduler.pending()).toBe(0);
 });
 it('reconhece uma vez, limita a frequência e não processa depois de cancelar',()=>{
  const scheduler=frames(),read=vi.fn<()=>string|null>().mockReturnValueOnce(null).mockReturnValue('codigo'),onCode=vi.fn();
  const stop=startQRScanLoop(read,onCode,vi.fn(),scheduler);
  scheduler.tick(0);scheduler.tick(60);expect(read).toHaveBeenCalledTimes(1);
  scheduler.tick(160);scheduler.tick(320);
  expect(onCode).toHaveBeenCalledExactlyOnceWith('codigo');expect(scheduler.pending()).toBe(0);
  stop();
  const secondRead=vi.fn(()=>null),cancel=startQRScanLoop(secondRead,vi.fn(),vi.fn(),scheduler);
  cancel();scheduler.tick(500);expect(secondRead).not.toHaveBeenCalled();
 });
});
