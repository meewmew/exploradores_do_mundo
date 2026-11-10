import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import { interpolateElevation } from '../scripts/build-africa-terrain.mjs';
import { getTerrainConfig } from '../src/services/terrain';
import { CONTINENT_IDS, type Continent } from '../src/types/continent';

interface TestProjection {
  rotate(value: number[]): TestProjection;
  translate(value: [number, number]): TestProjection;
  scale(value: number): TestProjection;
  invert(value: [number, number]): [number, number] | null;
}
const { geoAzimuthalEqualArea } = createRequire(import.meta.url)('d3-geo') as { geoAzimuthalEqualArea: () => TestProjection };
const seaLevelPointIds = new Set(['grande-barreira-coral', 'opera-sydney']);
// Amostras terrestres do recorte GLO-30 original nas coordenadas dos três pins.
const africaElevations: Record<string, number> = {
  'piramides-gize': 90.012422,
  'cataratas-vitoria': 936.684867,
  kilimanjaro: 4008.092607,
};

it('serve relevo e três lugares para cada continente na ficha e no modo RA', async () => {
  for (const id of CONTINENT_IDS) {
    const continent = JSON.parse(await readFile(`src/data/continents/${id}.json`, 'utf8')) as Continent;
    const config = getTerrainConfig(continent);
    expect(config.file).toBe(`models/${id}-terrain.glb`);
    expect(config.points).toHaveLength(3);
    expect(config.points.map(point => point.id)).toEqual(continent.pontosTuristicos!.map(point => point.id));
  }
});

it('cada GLB usa o DEM registrado e prende os pontos à posição geográfica', async () => {
  const source = await readFile('data-src/dem/etopo5-global-0.5deg.json');
  const grid = JSON.parse(source.toString('utf8'));
  const report = JSON.parse(await readFile('models-report.json', 'utf8'));
  expect(grid.latitude).toHaveLength(361);
  expect(grid.longitude).toHaveLength(720);
  for (const id of CONTINENT_IDS) {
    const metadata = JSON.parse(await readFile(`src/data/generated/${id}-terrain.json`, 'utf8'));
    const publicMetadata = JSON.parse(await readFile(`public/content/${id}-terrain.json`, 'utf8'));
    expect(publicMetadata).toEqual(metadata);
    expect(metadata.continentId).toBe(id);
    expect(metadata.file).toBe(`models/${id}-terrain.glb`);
    const africa = id === 'africa';
    if (africa) {
      expect(metadata.dem.dataset).toBe('Copernicus DEM GLO-30');
      expect(metadata.dem.sha256).toBe('345ddf2b3b3a2824d3a3ed6eef76560d66e4847bfab16ba5436dfd62c19f8faf');
      expect(metadata.verticalExaggeration).toBe(28);
    } else expect(createHash('sha256').update(source).digest('hex')).toBe(metadata.dem.sha256);
    expect(metadata.points).toHaveLength(3);
    expect(report).toContainEqual(expect.objectContaining({ id: `${id}-terrain`, arquivo: metadata.file, tipo: 'relevo' }));

    const projection = geoAzimuthalEqualArea().rotate(metadata.projection.rotate).translate([0, 0]).scale(metadata.projection.sphereRadiusMeters);
    const document = await new NodeIO().readBinary(await readFile(`public/${metadata.file}`));
    const surface = document.getRoot().listMeshes()[0].listPrimitives()[0];
    const top = surface.getAttribute('POSITION')!.getArray()!;
    expect(surface.getAttribute('COLOR_0')?.getCount()).toBe(top.length / 3);
    for (const point of metadata.points) {
      const [x, y, z] = point.posicao;
      const projected: [number, number] = [
        x / metadata.normalization.horizontalScale + metadata.normalization.projectedOriginMeters[0],
        z / metadata.normalization.horizontalScale + metadata.normalization.projectedOriginMeters[1],
      ];
      const coordinate = projection.invert(projected);
      if (point.id !== 'estacao-amundsen-scott') {
        expect(coordinate).not.toBeNull();
        expect(coordinate![0]).toBeCloseTo(point.coordenadas.lng, 3);
        expect(coordinate![1]).toBeCloseTo(point.coordenadas.lat, 3);
      }
      const override = seaLevelPointIds.has(point.id) ? 0 : undefined;
      const elevation = africa ? africaElevations[point.id] : Math.max(0, interpolateElevation(grid, point.coordenadas.lng, point.coordenadas.lat));
      expect(y).toBeCloseTo(metadata.normalization.baseHeight + (override ?? elevation) * metadata.normalization.elevationScale, 6);
      let matched = false;
      for (let i = 0; i < top.length; i += 3) {
        if (Math.hypot(top[i] - x, top[i + 1] - y, top[i + 2] - z) < 1e-7) { matched = true; break; }
      }
      expect(matched, `${id}.${point.id}`).toBe(true);
    }

    const bytes = await readFile(`public/${metadata.file}`);
    expect(bytes.length).toBeLessThanOrEqual(400 * 1024);
    expect(document.getRoot().listTextures()).toHaveLength(0);
    expect(document.getRoot().listMaterials().length).toBeLessThanOrEqual(2);
    expect(document.getRoot().listMaterials().every(material => material.getAlphaMode() === 'OPAQUE')).toBe(true);
    let triangles = 0, minimumY = Infinity, maximumY = -Infinity, radius = 0;
    for (const mesh of document.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
      triangles += primitive.getIndices()!.getCount() / 3;
      const positions = primitive.getAttribute('POSITION')!.getArray()!;
      for (let i = 0; i < positions.length; i += 3) {
        expect([positions[i], positions[i + 1], positions[i + 2]].every(Number.isFinite)).toBe(true);
        minimumY = Math.min(minimumY, positions[i + 1]); maximumY = Math.max(maximumY, positions[i + 1]);
        radius = Math.max(radius, Math.hypot(positions[i], positions[i + 1], positions[i + 2]));
      }
    }
    expect(triangles).toBe(metadata.limits.triangles);
    expect(triangles).toBeLessThanOrEqual(20000);
    expect(minimumY).toBe(0);
    expect(maximumY).toBeGreaterThan(metadata.normalization.baseHeight + (africa ? 0.02 : 0.03));
    expect(radius).toBeLessThanOrEqual(1);
  }
});
