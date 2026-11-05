import type { ReactNode } from 'react';

type IconName = 'home' | 'map' | 'settings' | 'scan' | 'camera' | 'compass' | 'book' | 'spark' | 'arrow-right' | 'chevron-right' | 'lock';
const paths: Record<IconName, ReactNode> = {
  camera: <><path d="M8 6 10 3h4l2 3h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" /></>,
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
  map: <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16M15 5v16" />,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></>,
  scan: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12h10" /><path d="M8 8h2v2H8Zm6 6h2v2h-2Z" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6Z" /></>,
  book: <path d="M12 5v16M3 3c4 0 7 1 9 3 2-2 5-3 9-3v15c-4 0-7 1-9 3-2-2-5-3-9-3Z" />,
  spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />,
  'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
};

export function InterfaceIcon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`interface-icon ${className}`} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
