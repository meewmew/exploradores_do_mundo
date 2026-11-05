import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map(m => [m[1], m[2]]));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
const pairs = [];
for (const foreground of ['ink', 'ink-muted']) {
  for (const background of ['canvas', 'surface', 'surface-warm', 'tint', 'tint-soft', 'warm', 'warm-soft', 'success-tint', 'success-soft', 'yellow']) {
    pairs.push([foreground, background, 4.5]);
  }
}
pairs.push(['accent-ink', 'tint-soft', 4.5], ['success', 'success-soft', 4.5], ['danger', 'warm-soft', 4.5],
  ['surface', 'ink', 4.5], ['surface', 'accent-ink', 4.5], ['ink', 'tint-strong', 4.5],
  ['focus', 'canvas', 3], ['focus', 'tint-soft', 3], ['focus', 'warm-soft', 3], ['focus', 'success-soft', 3],
  ['border-control', 'surface', 3], ['border-control', 'tint', 3], ['border-control', 'tint-soft', 3]);
pairs.push(['ink', 'action', 4.5], ['ink', 'water', 4.5], ['surface', 'action-edge', 4.5],
  ['focus', 'action', 3], ['focus', 'yellow', 3]);
const results = pairs.map(([foreground, background, minimum]) => {
  const ratio = contrast(tokens[foreground], tokens[background]);
  return { foreground, background, ratio: Number(ratio.toFixed(2)), minimum, passed: ratio >= minimum };
});
console.table(results);
console.log(`${results.filter(r => r.passed).length}/${results.length} pares de contraste aprovados. Não substitui revisão visual ou de acessibilidade no aparelho.`);
if (results.some(r => !r.passed)) process.exitCode = 1;
