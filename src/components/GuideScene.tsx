import { asset } from '../services/contentRepository';

export function GuideScene({ kind }: { kind: 'map' | 'sheet' | 'ar' }) {
  if (kind === 'sheet') return <img className="guide-scene" src={asset('images/guia-qr.svg')} alt="" />;
  return <svg className="guide-scene" viewBox="0 0 220 160" fill="none" aria-hidden="true" focusable="false">
    {kind === 'map' ? <>
      <path d="m21 38 56-14 63 14 57-14v101l-57 13-63-13-56 13Z" fill="white" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M77 25v99M140 39v99" stroke="var(--water)" strokeWidth="2" />
      <path d="m35 57 26-8 12 10-8 22-21 5-8-13ZM91 78l23-10 14 13-9 22-20 6-10-18ZM155 57l26-7 1 32-20 5-12-17Z" fill="var(--success-tint)" />
      <path d="M136 63c0-17-12-29-27-29S82 46 82 63c0 22 27 42 27 42s27-20 27-42Z" fill="var(--ink)" /><circle cx="109" cy="61" r="10" fill="white" />
      <path d="m168 111 6 13 14 5-14 5-6 14-5-14-14-5 14-5Z" fill="var(--yellow)" />
    </> : <>
      <path d="m27 111 104-17 67 28-104 23Z" fill="white" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="m89 118 33-5 21 9-33 5Z" fill="var(--ink)" />
      <path d="m77 62 23-7 52 21-23 7Z" fill="var(--water)" /><path d="m77 62 52 21v12L77 74ZM129 83l23-7v12l-23 7Z" fill="#9acb7d" />
      <path d="M109 113V95M109 61V49" stroke="var(--ink)" strokeWidth="2" strokeDasharray="3 4" />
      <rect x="31" y="17" width="51" height="77" rx="11" fill="var(--warm)" stroke="var(--ink)" strokeWidth="3" transform="rotate(-12 31 17)" />
      <path d="m42 28 30-6 9 43-30 6Z" fill="white" /><path d="m48 46 12-10 10 15-13 9Z" fill="var(--water)" />
      <circle cx="65" cy="78" r="4" fill="var(--ink)" /><path d="m175 29 5 12 13 5-13 5-5 13-5-13-12-5 12-5Z" fill="var(--yellow)" />
    </>}
  </svg>;
}
