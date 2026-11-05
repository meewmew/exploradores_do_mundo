type Listener = () => void;
import { clearAdminProgress } from './adminProgress';
let active = false;
const listeners = new Set<Listener>();

export const isOrganizerSession = () => active;
export const subscribeOrganizerSession = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function setOrganizerSession(value: boolean) {
  if (active === value) return;
  active = value;
  if (!value) clearAdminProgress();
  listeners.forEach(listener => listener());
}
