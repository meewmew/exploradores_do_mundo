import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const url = 'https://3delevationmap.com/processed/africa/dem.json';
const sha256 = '345ddf2b3b3a2824d3a3ed6eef76560d66e4847bfab16ba5436dfd62c19f8faf';
const localFile = path.join('..', 'Modelos 3D dos continentes - 3D Elevation Map', 'DEM original', 'africa.json');

export async function loadAfricaElevation() {
  const bytes = await readFile(process.env.AFRICA_DEM_FILE || localFile).catch(async error => {
    if (error.code !== 'ENOENT' || process.env.AFRICA_DEM_FILE) throw error;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`DEM da África indisponível: ${response.status}. Defina AFRICA_DEM_FILE.`);
    return Buffer.from(await response.arrayBuffer());
  });
  if (createHash('sha256').update(bytes).digest('hex') !== sha256) {
    throw new Error('O DEM da África mudou. Use o arquivo original com AFRICA_DEM_FILE.');
  }
  const { W, H, bbox, zMin, zMax, cellKm, elev, land } = JSON.parse(bytes);
  const samples = Buffer.from(elev, 'base64');
  const landMask = Buffer.from(land, 'base64');
  const [west, south, east, north] = bbox;
  const contains = (lng, lat) => lng >= west && lng <= east && lat >= south && lat <= north;

  function sample(lng, lat) {
    if (!contains(lng, lat)) return;
    const x = (lng - west) / (east - west) * (W - 1);
    const y = (north - lat) / (north - south) * (H - 1);
    let nearest, bestDistance = Infinity;
    // A costa do Natural Earth pode cruzar células oceânicas no recorte do DEM.
    for (let row = Math.max(0, Math.round(y) - 4); row <= Math.min(H - 1, Math.round(y) + 4); row++) {
      for (let col = Math.max(0, Math.round(x) - 4); col <= Math.min(W - 1, Math.round(x) + 4); col++) {
        const index = row * W + col;
        if (!(landMask[index >> 3] & (1 << (7 - (index & 7))))) continue;
        const distance = (col - x) ** 2 + (row - y) ** 2;
        if (distance >= bestDistance) continue;
        nearest = index;
        bestDistance = distance;
      }
    }
    if (nearest !== undefined) return zMin + samples.readUInt16LE(nearest * 2) / 65535 * (zMax - zMin);
  }

  return {
    contains, sample,
    metadata: {
      dataset: 'Copernicus DEM GLO-30', url, sha256,
      sourceResolutionMeters: 30, exportedCellKm: cellKm, gridDimensions: [W, H], bbox,
      gridProjection: 'WGS84 longitude/latitude', encoding: 'UInt16 LE',
      sampling: 'Célula terrestre mais próxima em janela de até 9 × 9 células.',
    },
  };
}
