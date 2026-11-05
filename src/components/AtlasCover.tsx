import map from '../data/generated/map.json';

export function AtlasCover() {
  return <div className="atlas-cover" aria-hidden="true">
    <svg viewBox="0 -35 1000 580" focusable="false">
      <path d="M0 127.5H1000M0 255H1000M0 382.5H1000M250 0V510M500 0V510M750 0V510" fill="none" stroke="var(--border-control)" strokeOpacity=".12" strokeDasharray="4 8" />
      <g fill="white" opacity=".8"><path d="M30 70c-18 0-18-26 0-26 2-27 43-28 48-3 28-5 35 29 11 29Z"/><path d="M784 8c-18 0-18-26 0-26 2-27 43-28 48-3 28-5 35 29 11 29Z"/><path d="M880 455c-18 0-18-26 0-26 2-27 43-28 48-3 28-5 35 29 11 29Z"/></g>
      <g transform="translate(0 5)" opacity=".13">{map.map(c => <path key={c.id} d={c.d} fill="var(--ink)" />)}</g>
      {map.map(c => <path key={c.id} className={`atlas-land land-${c.id}`} d={c.d} stroke="var(--ink)" strokeOpacity=".45" strokeWidth="1.8" strokeLinejoin="round" />)}
      <path d="M122 344C85 420 250 475 290 420S307 275 398 328 700 420 756 287 960 236 942 127" stroke="var(--ink)" strokeOpacity=".38" strokeDasharray="6 10" strokeWidth="3" fill="none" />
      <g fill="var(--ink)" fontFamily="var(--font-heading)" fontWeight="500" fontSize="23" textAnchor="middle" stroke="white" strokeWidth="6" paintOrder="stroke" strokeLinejoin="round"><text x="212" y="150">América</text><text x="500" y="252">África</text><text x="520" y="103">Europa</text><text x="730" y="182">Ásia</text><text x="843" y="372">Oceania</text><text x="520" y="505">Antártida</text></g>
      <g transform="translate(927 110) rotate(-20)"><path d="m0-32 8 23 22 15-3 7-22-5-8 18-7-2 2-22-20-13 4-7 17 5Z" fill="white" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round"/></g>
      <g transform="translate(104 360)"><circle r="33" fill="#fff8e9" stroke="var(--ink)" strokeWidth="2"/><path d="m0-23 6 17 17 6-17 6-6 17-6-17-17-6 17-6Z" fill="#ff922e"/><circle r="4" fill="var(--ink)"/></g>
    </svg>
    <span className="atlas-compass">6 continentes<br />uma aventura!</span>
  </div>;
}
