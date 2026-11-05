import { expect, it } from 'vitest';
import { LocalStorageRepository, type StoragePort } from '../src/services/collectionRepository';

class FailingStorage implements StoragePort {
  values = new Map<string, string>();
  failReads = false;
  failWrites = false;
  getItem(key: string) {
    if (this.failReads) throw new Error('Storage bloqueado');
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('Sem espaço');
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}

it('preserva o progresso recarregado quando o storage passa a falhar durante a sessão', async () => {
  const storage = new FailingStorage();
  const saved = new LocalStorageRepository(storage);
  await saved.unlock('africa');
  await saved.completeActivity('africa-formato');
  await saved.setProfile({ anoEscolar: '3' });

  const reopened = new LocalStorageRepository(storage);
  expect(await reopened.getUnlocked()).toEqual(['africa']);
  storage.failReads = true;
  expect(await reopened.getUnlocked()).toEqual(['africa']);
  expect(await reopened.getCompletedActivities()).toEqual(['africa-formato']);
  expect(await reopened.getProfile()).toEqual({ anoEscolar: '3' });
  expect(reopened.isPersistent).toBe(false);

  await reopened.unlock('asia');
  expect(await reopened.getUnlocked()).toEqual(['africa', 'asia']);
});

it('recupera descobertas já salvas mesmo quando o teste inicial de escrita falha', async () => {
  const storage = new FailingStorage();
  await new LocalStorageRepository(storage).unlock('america');
  storage.failWrites = true;

  const reopened = new LocalStorageRepository(storage);
  expect(reopened.isPersistent).toBe(false);
  expect(await reopened.getUnlocked()).toEqual(['america']);
  await reopened.completeActivity('america-mapa');
  expect(await reopened.getCompletedActivities()).toEqual(['america-mapa']);
});

it('não restaura descobertas antigas depois que outro contexto apaga o progresso', async () => {
  const storage = new FailingStorage();
  const repository = new LocalStorageRepository(storage);
  await repository.unlock('africa');
  storage.removeItem(repository.key);
  expect(await repository.getUnlocked()).toEqual([]);
  storage.failReads = true;
  expect(await repository.getUnlocked()).toEqual([]);
});
