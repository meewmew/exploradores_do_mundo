import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const assets = [
  ['data-src/geo/ne_50m_admin_0_countries.geojson', 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson'],
  ['data-src/geo/ne_50m_populated_places_simple.geojson', 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_populated_places_simple.geojson'],
  ['public/vendor/aframe-1.6.0.min.js', 'https://raw.githubusercontent.com/aframevr/aframe/v1.6.0/dist/aframe-master.min.js'],
  ['public/vendor/ar-3.4.7.js', 'https://raw.githubusercontent.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js'],
  ['public/vendor/camera_para.dat', 'https://raw.githubusercontent.com/AR-js-org/AR.js/3.4.7/data/data/camera_para.dat'],
  ['public/vendor/model-viewer-4.0.0.min.js', 'https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js'],
  ['public/vendor/jsQR-1.4.0.js', 'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js'],
  ['data-src/un-members.html', 'https://www.un.org/en/about-us/member-states'],
  ['data-src/un-observers.html', 'https://www.un.org/en/about-us/non-member-states'],
];
const manifest = [];
for (const [file, url] of assets) {
  const path = join(process.cwd(), file);
  await mkdir(dirname(path), { recursive: true });
  let buffer;
  try { buffer = await readFile(path); }
  catch {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(path, buffer);
    } catch (error) {
      console.error(`FALHOU: ${url} → ${file}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
  }
  manifest.push({ file, url, sha256: createHash('sha256').update(buffer).digest('hex'), bytes: buffer.length });
  console.log(`${file}: ${buffer.length} bytes`);
}
await writeFile('data-src/assets-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
