import { LocalStorageRepository, type StoragePort } from './collectionRepository';

class SessionStorage implements StoragePort {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const storage = new SessionStorage();
export const adminProgress = new LocalStorageRepository(storage);
export function clearAdminProgress() { storage.clear(); }
