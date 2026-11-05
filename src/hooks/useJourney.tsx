import { createContext, useContext, useState, type ReactNode } from 'react';
import { continentFromURL } from '../services/discovery';
import { isContinentId } from '../services/collectionRepository';
import type { ContinentId } from '../types/continent';

type Role = 'explorer' | 'organizer';
interface JourneyState {
  role: Role | null;
  instructed: boolean;
  pending?: ContinentId;
  choose: (role: Role) => void;
  finishInstructions: () => void;
  clearPending: () => void;
}
const JourneyContext = createContext<JourneyState | null>(null);

export function initialDestination(search: string, hash: string): ContinentId | undefined {
  const query = continentFromURL(search);
  if (query) return query;
  const route = /^#\/(?:continente|qr|ar|paises|atividade)\/([^/?#]+)/.exec(hash)?.[1];
  return isContinentId(route) ? route : undefined;
}

export function entryRedirect(path: string, role: Role | null, instructed: boolean, authorized: boolean) {
  if (path === '/') return null;
  if (!role) return '/';
  if (role === 'organizer' && !authorized && path !== '/organizador') return '/organizador';
  if (role === 'explorer' && !instructed && path !== '/orientacao') return '/orientacao';
  return null;
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  // A escolha de perfil vale nesta abertura; o progresso continua no repositório existente.
  const [role, setRole] = useState<Role | null>(null);
  const [instructed, setInstructed] = useState(false);
  const [pending, setPending] = useState(() => initialDestination(window.location.search, window.location.hash));
  return <JourneyContext.Provider value={{ role, instructed, pending,
    choose: value => { setRole(value); setInstructed(false); if (value === 'organizer') setPending(undefined); },
    finishInstructions: () => setInstructed(true), clearPending: () => setPending(undefined),
  }}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('JourneyProvider ausente');
  return context;
}
