import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const server = 'https://erddap.ioos.us/erddap';
const dataset = 'etopo5_EDDGridCopy';
const outputFile = path.join('data-src', 'dem', 'etopo5-global-0.5deg.json');
const metadataUrl = `${server}/info/${dataset}/index.json`;
const metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(30000) });
if (!metadataResponse.ok) throw new Error(`Metadados DEM: HTTP ${metadataResponse.status}`);
const metadata = await metadataResponse.json();
const attributes = Object.fromEntries(metadata.table.rows
  .filter(row => row[0] === 'attribute' && row[1] === 'NC_GLOBAL')
  .map(row => [row[2], row[4]]));
if (!attributes.license?.includes('used and redistributed for free')) {
  throw new Error('Licença DEM diferente da esperada; conferir antes de distribuir.');
}

const downloads = [];
const samples = new Map();
for (const [from, to] of [[-90, -45], [-45, 0], [0, 45], [45, 90]]) {
  const query = `ROSE[(${from}):6:(${to})][(0):6:(359.92)]`;
  const url = `${server}/griddap/${dataset}.csv?${query}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`Recorte DEM: HTTP ${response.status} — ${url}`);
  const csv = await response.text();
  if (!csv.startsWith('latitude,longitude,ROSE\n')) throw new Error('Colunas DEM inesperadas.');
  const rows = csv.trim().split('\n').slice(2);
  for (const line of rows) {
    const [lat, originalLng, height] = line.split(',').map(Number);
    if (![lat, originalLng, height].every(Number.isFinite) || Math.abs(height) > 12000) {
      throw new Error('Amostra DEM ausente ou inválida.');
    }
    const lng = originalLng > 180 ? originalLng - 360 : originalLng;
    samples.set(`${lat},${lng}`, { lat, lng, height });
  }
  downloads.push({ url, sha256: createHash('sha256').update(csv).digest('hex'), bytes: Buffer.byteLength(csv), rows: rows.length });
}

const latitude = [...new Set([...samples.values()].map(point => point.lat))].sort((a, b) => a - b);
const longitude = [...new Set([...samples.values()].map(point => point.lng))].sort((a, b) => a - b);
if (latitude.length !== 361 || longitude.length !== 720) {
  throw new Error(`Grade DEM incompleta: ${latitude.length} × ${longitude.length}.`);
}
const rowIndex = new Map(latitude.map((value, index) => [value, index]));
const columnIndex = new Map(longitude.map((value, index) => [value, index]));
const elevation = Array.from({ length: latitude.length }, () => Array(longitude.length).fill(null));
for (const point of samples.values()) elevation[rowIndex.get(point.lat)][columnIndex.get(point.lng)] = point.height;
if (elevation.some(row => row.some(value => value === null))) throw new Error('Grade DEM tem células ausentes.');

const output = {
  version: 1, dataset: 'NOAA ETOPO5', sourceId: 'noaa-etopo5', metadataUrl,
  sourceResolutionArcMinutes: 5, samplingStride: 6, sampledSpacingDegrees: 0.5,
  horizontalCoordinates: 'longitude/latitude em graus; eixo original 0–360 convertido para -180–180',
  elevationUnits: 'm', elevationVariable: 'ROSE', historicalDataset: true,
  license: attributes.license, summary: attributes.summary, history: attributes.history,
  downloads, latitude, longitude, elevation,
};
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, JSON.stringify(output) + '\n');
console.log(`DEM global salvo: ${latitude.length} × ${longitude.length} amostras em ${outputFile}.`);
