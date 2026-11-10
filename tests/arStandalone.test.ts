import { describe, expect, it, vi } from 'vitest';
import { createStandaloneRepository, discoverFromMarker } from '../src/services/arStandalone';
import type { StoragePort } from '../src/services/collectionRepository';

describe('Progresso da RA em página inteira',()=>{
 it('mantém descobertas do ADM em memória sem acessar o progresso dos alunos',async()=>{
  const stored=new Map([['exploradores:v1',JSON.stringify({unlocked:['asia'],activities:[],profile:{}})]]);
  const storage:StoragePort={getItem:vi.fn(key=>stored.get(key)??null),setItem:vi.fn((key,value)=>{stored.set(key,value);}),removeItem:vi.fn(key=>{stored.delete(key);})};
  const preview=createStandaloneRepository(true,storage);
  await discoverFromMarker(preview,'africa',{continentId:'africa',stableMs:500});
  expect(await preview.getUnlocked()).toEqual(['africa']);
  expect(storage.getItem).not.toHaveBeenCalled();expect(storage.setItem).not.toHaveBeenCalled();
  expect(await createStandaloneRepository(true,storage).getUnlocked()).toEqual([]);
  const regular=createStandaloneRepository(false,storage);
  expect(await regular.getUnlocked()).toEqual(['asia']);
  await discoverFromMarker(regular,'africa',{continentId:'africa',stableMs:500});
  expect(await createStandaloneRepository(false,storage).getUnlocked()).toEqual(['asia','africa']);
 });
});
