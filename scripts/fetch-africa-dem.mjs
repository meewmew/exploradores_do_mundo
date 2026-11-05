import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const server = 'https://erddap.ioos.us/erddap';
const dataset = 'etopo5_EDDGridCopy';
const directory = path.join('data-src', 'dem');
const queries = [
  'ROSE[(-36):6:(38)][(333):6:(359.92)]',
  'ROSE[(-36):6:(38)][(0):6:(65)]',
];
const metadataUrl = `${server}/info/${dataset}/index.json`;
const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Metadados DEM: HTTP ${response.status}`);
const metadata = await response.json();
const attributes = Object.fromEntries(metadata.table.rows.filter(row => row[0] === 'attribute' && row[1] === 'NC_GLOBAL').map(row => [row[2], row[4]]));
if (!attributes.license?.includes('used and redistributed for free')) throw new Error('Licença DEM diferente da esperada; conferir antes de distribuir.');
await mkdir(directory, { recursive: true });
const samples = [];
const downloads = [];
for (const query of queries) {
  const url = `${server}/griddap/${dataset}.csv?${query}`;
  const result = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!result.ok) throw new Error(`Recorte DEM: HTTP ${result.status} — ${url}`);
  const csv = await result.text();
  if (!csv.startsWith('latitude,longitude,ROSE\n')) throw new Error('Colunas DEM inesperadas.');
  for (const line of csv.trim().split('\n').slice(2)) {
    const [lat, originalLng, height] = line.split(',').map(Number);
    if (![lat, originalLng, height].every(Number.isFinite) || Math.abs(height) > 12000) throw new Error('Amostra DEM ausente ou inválida.');
    samples.push({ lat, lng: originalLng > 180 ? originalLng - 360 : originalLng, height });
  }
  downloads.push({ url, sha256: createHash('sha256').update(csv).digest('hex'), bytes: Buffer.byteLength(csv) });
}
const latitude = [...new Set(samples.map(p => p.lat))].sort((a, b) => a - b);
const longitude = [...new Set(samples.map(p => p.lng))].sort((a, b) => a - b);
const rowIndex = new Map(latitude.map((value, i) => [value, i]));
const columnIndex = new Map(longitude.map((value, i) => [value, i]));
const elevation = Array.from({ length: latitude.length }, () => Array(longitude.length).fill(null));
for (const point of samples) elevation[rowIndex.get(point.lat)][columnIndex.get(point.lng)] = point.height;
if (elevation.some(row => row.some(value => value === null))) throw new Error('Grade DEM incompleta.');
const output = {
  version: 1, dataset: 'NOAA ETOPO5', sourceId: 'noaa-etopo5', metadataUrl,
  sourceResolutionArcMinutes: 5, samplingStride: 6, sampledSpacingDegrees: 0.5,
  horizontalCoordinates: 'longitude/latitude em graus; eixo original 0–360 convertido para -180–180',
  elevationUnits: 'm', elevationVariable: 'ROSE', historicalDataset: true,
  license: attributes.license, summary: attributes.summary, history: attributes.history,
  downloads, latitude, longitude, elevation,
};
const file = path.join(directory, 'etopo5-africa.json');
await writeFile(file, JSON.stringify(output) + '\n');
console.log(`DEM real salvo: ${latitude.length} × ${longitude.length} amostras em ${file}.`);
