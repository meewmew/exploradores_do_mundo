import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { geoAzimuthalEqualArea, geoArea, geoIdentity, geoStream } from 'd3-geo';
import { topology } from 'topojson-server';
import { feature, merge } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { BufferGeometry, BufferAttribute } from 'three';
import earcut from 'earcut';
import { loadAfricaElevation } from './africa-elevation-map.mjs';

const json = async file => JSON.parse(await readFile(file, 'utf8'));
const EARTH_RADIUS_METERS = 6371000;
const VERTICAL_EXAGGERATION = 160;
const BASE_HEIGHT = 0.025;
const TERRAIN_SETTINGS = {
  africa: { center: [20, 2], meshStepMeters: 70000, simplification: 0.02 },
  america: { center: [-96, 20], meshStepMeters: 400000, simplification: 0.1 },
  antartida: { center: [0, -90], meshStepMeters: 180000, simplification: 0.06 },
  asia: { center: [100, 35], meshStepMeters: 300000, simplification: 0.1 },
  europa: { center: [15, 52], meshStepMeters: 120000, simplification: 0.06 },
  oceania: { center: [135, -25], meshStepMeters: 180000, simplification: 0.08 },
};

function bracket(axis, value) {
  if (value < axis[0] || value > axis.at(-1)) throw new Error(`Coordenada fora do recorte DEM: ${value}`);
  let low = 0, high = axis.length - 1;
  while (high - low > 1) { const middle = (low + high) >> 1; if (axis[middle] > value) high = middle; else low = middle; }
  return [low, high, (value - axis[low]) / (axis[high] - axis[low])];
}

export function interpolateElevation(grid, lng, lat) {
  const longitude = ((lng + 180) % 360 + 360) % 360 - 180;
  const first = grid.longitude[0], last = grid.longitude.at(-1);
  let x0, x1, tx;
  if (longitude < first) { x0 = grid.longitude.length - 1; x1 = 0; tx = (longitude - (last - 360)) / (first - (last - 360)); }
  else if (longitude > last) { x0 = grid.longitude.length - 1; x1 = 0; tx = (longitude - last) / (first + 360 - last); }
  else [x0, x1, tx] = bracket(grid.longitude, longitude);
  const [y0, y1, ty] = bracket(grid.latitude, lat);
  const a = grid.elevation[y0][x0] * (1 - tx) + grid.elevation[y0][x1] * tx;
  const b = grid.elevation[y1][x0] * (1 - tx) + grid.elevation[y1][x1] * tx;
  return a * (1 - ty) + b * ty;
}

function polygonsFromStream(geometry, transform) {
  const polygons = [];
  let polygon, ring;
  geoStream(geometry, transform.stream({
    polygonStart() { polygon = []; },
    polygonEnd() { if (polygon.length) polygons.push(polygon); },
    lineStart() { ring = []; },
    lineEnd() { if (ring.length >= 3) polygon.push(ring); },
    point(x, y) { ring.push([x, y]); },
  }));
  return polygons;
}

function triangulate(rings) {
  const flat = [], holes = [];
  for (const [i, ring] of rings.entries()) { if (i) holes.push(flat.length / 2); for (const point of ring) flat.push(...point); }
  return { points: rings.flat(), triangles: earcut(flat, holes, 2) };
}

function color(height, copernicus) {
  const stops = copernicus
    ? [[0, [25, 102, 77]], [700, [72, 144, 83]], [1450, [142, 176, 91]], [2300, [211, 184, 98]], [3300, [213, 132, 73]], [4500, [163, 83, 79]], [5900, [246, 240, 232]]]
    : [[0, [150, 177, 129]], [600, [184, 195, 139]], [1500, [216, 195, 139]], [2800, [189, 153, 116]], [4500, [239, 229, 207]]];
  let right = stops.findIndex(([value]) => value >= height);
  if (right <= 0) return stops[right < 0 ? stops.length - 1 : 0][1];
  const [a, ac] = stops[right - 1], [b, bc] = stops[right], t = (height - a) / (b - a);
  return ac.map((value, i) => Math.round(value * (1 - t) + bc[i] * t));
}

export async function buildContinentTerrain(continentId) {
  const settings = TERRAIN_SETTINGS[continentId];
  if (!settings) throw new Error(`Continente sem configuração de relevo: ${continentId}`);
  const gridFile = path.join('data-src', 'dem', 'etopo5-global-0.5deg.json');
  const file = `models/${continentId}-terrain.glb`;
  const [grid, geo, mapping, touristSpots] = await Promise.all([
    continentId === 'africa' ? loadAfricaElevation() : json(gridFile), json(path.join('data-src', 'geo', 'ne_50m_admin_0_countries.geojson')),
    json(path.join('data-src', 'country-continent.json')), json(path.join('data-src', 'tourist-spots.json')),
  ]);
  const copernicus = continentId === 'africa';
  const sampleElevation = copernicus ? grid.sample : (lng, lat) => interpolateElevation(grid, lng, lat);
  const verticalExaggeration = copernicus ? 28 : VERTICAL_EXAGGERATION;
  const continentFeatures = { type: 'FeatureCollection', features: geo.features.filter(f => mapping[f.properties.ADM0_A3] === continentId) };
  const topo = topology({ [continentId]: continentFeatures });
  const dissolved = merge(topo, topo.objects[continentId].geometries);
  const simplified = presimplify(topology({ [continentId]: dissolved }));
  const shape = feature(simplify(simplified, settings.simplification), simplified.objects[continentId]).geometry;
  const geographicPolygons = shape.type === 'Polygon' ? [shape.coordinates] : shape.coordinates;
  const land = { type: 'MultiPolygon', coordinates: geographicPolygons.filter(rings =>
    geoArea({ type: 'Polygon', coordinates: rings }) > 0.000002 &&
    (!copernicus || rings[0].every(([lng, lat]) => grid.contains(lng, lat)))) };
  const projection = geoAzimuthalEqualArea().rotate([-settings.center[0], -settings.center[1]]).translate([0, 0]).scale(EARTH_RADIUS_METERS).precision(3000);
  const polygons = polygonsFromStream(land, projection);
  const allPoints = polygons.flat(2);
  const xMin = Math.min(...allPoints.map(p => p[0])), xMax = Math.max(...allPoints.map(p => p[0]));
  const zMin = Math.min(...allPoints.map(p => p[1])), zMax = Math.max(...allPoints.map(p => p[1]));
  const origin = [(xMin + xMax) / 2, (zMin + zMax) / 2];
  const radiusMeters = Math.max(...allPoints.map(p => Math.hypot(p[0] - origin[0], p[1] - origin[1])));
  const horizontalScale = 0.95 / radiusMeters;
  const elevationScale = horizontalScale * verticalExaggeration;
  const projected = [], positions = [], colors = [], indices = [], vertexByPosition = new Map();
  let rawMinimum = Infinity, rawMaximum = -Infinity;
  function addTopVertex(x, z, elevationOverride) {
    const key = `${Math.round(x * 1000)},${Math.round(z * 1000)}`;
    if (vertexByPosition.has(key)) return vertexByPosition.get(key);
    const [lng, lat] = projection.invert([x, z]);
    const rawElevation = sampleElevation(lng, lat);
    if (rawElevation === undefined) return;
    const elevation = elevationOverride ?? (copernicus ? rawElevation : Math.max(0, rawElevation));
    rawMinimum = Math.min(rawMinimum, rawElevation); rawMaximum = Math.max(rawMaximum, rawElevation);
    const index = positions.length / 3;
    positions.push((x - origin[0]) * horizontalScale, BASE_HEIGHT + elevation * elevationScale, (z - origin[1]) * horizontalScale);
    projected.push([x, z]);
    // COLOR_0 do glTF usa componentes lineares; a paleta é definida em sRGB.
    colors.push(...color(elevation, copernicus).map(value=>{const channel=value/255;return Math.round(255*(channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4));}));
    vertexByPosition.set(key, index);
    return index;
  }
  function addTopTriangle(a, b, c) {
    if (a === undefined || b === undefined || c === undefined) return;
    const pa = projected[a], pb = projected[b], pc = projected[c];
    const area = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
    if (Math.abs(area) < 0.01) return;
    indices.push(a, ...(area > 0 ? [c, b] : [b, c]));
  }
  for (const rings of polygons) {
    const points = rings.flat(), minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
    const minZ = Math.min(...points.map(p => p[1])), maxZ = Math.max(...points.map(p => p[1]));
    const planarShape = { type: 'Polygon', coordinates: rings.map(ring => [...ring, ring[0]]) };
    for (let x = Math.floor(minX / settings.meshStepMeters) * settings.meshStepMeters; x < maxX; x += settings.meshStepMeters) {
      for (let z = Math.floor(minZ / settings.meshStepMeters) * settings.meshStepMeters; z < maxZ; z += settings.meshStepMeters) {
        const clipped = polygonsFromStream(planarShape, geoIdentity().clipExtent([[x, z], [x + settings.meshStepMeters, z + settings.meshStepMeters]]));
        for (const polygon of clipped) {
          const part = triangulate(polygon), vertices = part.points.map(p => addTopVertex(...p));
          for (let i = 0; i < part.triangles.length; i += 3) addTopTriangle(...part.triangles.slice(i, i + 3).map(index => vertices[index]));
        }
      }
    }
  }
  const points = [], textOnlyPoints = [];
  for (const spot of touristSpots.continents[continentId] || []) {
    const [x, z] = projection([spot.coordenadas.lng, spot.coordenadas.lat]);
    let matched = false;
    for (let offset = 0; offset < indices.length; offset += 3) {
      const corners = indices.slice(offset, offset + 3).map(index => projected[index]);
      const [a, b, c] = corners, denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (z - c[1])) / denominator;
      const v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (z - c[1])) / denominator;
      if (u < -1e-8 || v < -1e-8 || u + v > 1 + 1e-8) continue;
      const vertex = addTopVertex(x, z);
      if (vertex === undefined) break;
      const [ia, ib, ic] = indices.splice(offset, 3);
      addTopTriangle(ia, ib, vertex); addTopTriangle(ib, ic, vertex); addTopTriangle(ic, ia, vertex);
      const posicao = positions.slice(vertex * 3, vertex * 3 + 3).map(value => Number(Math.fround(value).toFixed(8)));
      points.push({ ...spot, posicao }); matched = true; break;
    }
    if (!matched) {
      if (copernicus) { textOnlyPoints.push(spot); continue; }
      const rawElevation = interpolateElevation(grid, spot.coordenadas.lng, spot.coordenadas.lat);
      const polarStation = continentId === 'antartida' && spot.id === 'estacao-amundsen-scott';
      const seaLevelPoint = (continentId === 'oceania' && ['grande-barreira-coral', 'opera-sydney'].includes(spot.id));
      if (rawElevation > 0 && !polarStation && !seaLevelPoint) throw new Error(`Ponto fora da malha terrestre de ${continentId}: ${spot.id}`);
      const index = addTopVertex(x, z, seaLevelPoint ? 0 : undefined);
      const posicao = positions.slice(index * 3, index * 3 + 3).map(value => Number(Math.fround(value).toFixed(8)));
      points.push({ ...spot, posicao });
    }
  }
  const topVertexCount = positions.length / 3;
  const topTriangleCount = indices.length / 3;
  const edges = new Map();
  for (let i = 0; i < indices.length; i += 3) {
    const face = indices.slice(i, i + 3);
    for (let edge = 0; edge < 3; edge++) {
      const a = face[edge], b = face[(edge + 1) % 3], key = a < b ? `${a},${b}` : `${b},${a}`;
      const previous = edges.get(key); if (previous) previous.count++; else edges.set(key, { a, b, count: 1 });
    }
  }
  const sidePositions = [], sideIndices = [];
  const wallVertices = new Map();
  function wallVertex(index, bottom) {
    const key = index * 2 + Number(bottom);
    if (!wallVertices.has(key)) {
      const [x, y, z] = positions.slice(index * 3, index * 3 + 3);
      wallVertices.set(key, sidePositions.length / 3);
      sidePositions.push(x, bottom ? 0 : y, z);
    }
    return wallVertices.get(key);
  }
  for (const { a, b, count } of edges.values()) {
    if (count !== 1) continue;
    if (copernicus) {
      const at = wallVertex(a, false), bt = wallVertex(b, false);
      const ab = wallVertex(a, true), bb = wallVertex(b, true);
      sideIndices.push(at, bb, bt, at, ab, bb);
      continue;
    }
    const pa = positions.slice(a * 3, a * 3 + 3), pb = positions.slice(b * 3, b * 3 + 3), offset = sidePositions.length / 3;
    sidePositions.push(...pa, ...pb, pb[0], 0, pb[2], pa[0], 0, pa[2]);
    sideIndices.push(offset, offset + 2, offset + 1, offset, offset + 3, offset + 2);
  }
  for (const rings of polygons) {
    const part = triangulate(rings), offset = sidePositions.length / 3;
    for (const [x, z] of part.points) sidePositions.push((x - origin[0]) * horizontalScale, 0, (z - origin[1]) * horizontalScale);
    for (let i = 0; i < part.triangles.length; i += 3) {
      const corners = part.triangles.slice(i, i + 3), [a, b, c] = corners.map(index => part.points[index]);
      const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      sideIndices.push(...(area > 0 ? corners : [corners[0], corners[2], corners[1]]).map(index => offset + index));
    }
  }
  const doc = new Document(), buffer = doc.createBuffer();
  const topMaterial = doc.createMaterial(copernicus ? 'Elevação — Copernicus GLO-30' : 'Elevação — ETOPO5').setRoughnessFactor(0.9).setMetallicFactor(0).setDoubleSided(false);
  const sideMaterial = doc.createMaterial('Base cartográfica').setBaseColorFactor([0.54, 0.43, 0.32, 1]).setRoughnessFactor(0.95).setMetallicFactor(0).setDoubleSided(false);
  function primitive(vertices, faces, material, vertexColors) {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3)); geometry.setIndex(faces); geometry.computeVertexNormals();
    const result = doc.createPrimitive().setMaterial(material)
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(vertices)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(geometry.getAttribute('normal').array)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(faces)).setBuffer(buffer));
    if (vertexColors) result.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setNormalized(true).setArray(new Uint8Array(vertexColors)).setBuffer(buffer));
    geometry.dispose(); return result;
  }
  const mesh = doc.createMesh(`${continentId} — relevo real simplificado`).addPrimitive(primitive(positions, indices, topMaterial, colors)).addPrimitive(primitive(sidePositions, sideIndices, sideMaterial));
  doc.createScene(continentId).addChild(doc.createNode(`${continentId}: norte em -Z, leste em +X, elevação em +Y`).setMesh(mesh));
  const bytes = await new NodeIO().writeBinary(doc);
  const triangles = (indices.length + sideIndices.length) / 3;
  if (triangles > 20000 || bytes.length > 400 * 1024) throw new Error(`Relevo fora do orçamento: ${triangles} triângulos, ${bytes.length} bytes.`);
  const metadata = {
    version: copernicus ? 2 : 1, continentId, file,
    sourceIds: copernicus ? ['copernicus-glo30', '3d-elevation-map', 'natural-earth'] : ['noaa-etopo5', 'natural-earth'],
    verticalExaggeration,
    projection: { name: 'Azimutal equivalente de Lambert, esfera', rotate: [-settings.center[0], -settings.center[1]], sphereRadiusMeters: EARTH_RADIUS_METERS, axes: { x: 'leste', y: 'elevação', z: 'sul' } },
    normalization: { projectedOriginMeters: origin, radiusMeters, horizontalScale, elevationScale, baseHeight: BASE_HEIGHT },
    dem: {
      ...(copernicus ? grid.metadata : { dataset: grid.dataset, sourceResolutionArcMinutes: 5, sampledSpacingDegrees: 0.5 }),
      meshStepMeters: settings.meshStepMeters, minimumSampleMeters: rawMinimum, maximumSampleMeters: rawMaximum, historicalDataset: true,
      displayNegativeElevations: copernicus ? 'Preservadas nas células terrestres.' : 'limitadas a zero para excluir batimetria costeira',
      sha256: copernicus ? grid.metadata.sha256 : createHash('sha256').update(await readFile(gridFile)).digest('hex'),
    },
    limits: { triangles, bytes: bytes.length, materials: 2, textures: 0 },
    topVertexCount, topTriangleCount, points, pointPositions: Object.fromEntries(points.map(point => [point.id, point.posicao])),
    ...(copernicus && { textOnlyPoints }),
  };
  await Promise.all(['public/models', 'public/content', 'src/data/generated'].map(directory => mkdir(directory, { recursive: true })));
  await writeFile(path.join('public', file), bytes);
  const serialized = JSON.stringify(metadata, null, 2) + '\n';
  await writeFile(path.join('src', 'data', 'generated', `${continentId}-terrain.json`), serialized);
  await writeFile(path.join('public', 'content', `${continentId}-terrain.json`), serialized);
  const report = { id: `${continentId}-terrain`, tipo: 'relevo', arquivo: file, triangulos: triangles, tamanhoKb: Number((bytes.length / 1024).toFixed(2)), fontes: metadata.sourceIds };
  console.log(`${continentId} DEM: ${triangles} triângulos, ${report.tamanhoKb} KB, ${points.length} pontos, sem texturas.`);
  return report;
}

export async function buildContinentTerrains(continentIds = Object.keys(TERRAIN_SETTINGS)) {
  const reports = [];
  for (const continentId of continentIds) reports.push(await buildContinentTerrain(continentId));
  return reports;
}

export const buildAfricaTerrain = () => buildContinentTerrain('africa');

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const terrainReports = await buildContinentTerrains(process.argv.length > 2 ? process.argv.slice(2) : undefined);
  const previous = await json('models-report.json');
  const byId = new Map(previous.map(report => [report.id, report]));
  for (const report of terrainReports) byId.set(report.id, report);
  await writeFile('models-report.json', JSON.stringify([...byId.values()], null, 2) + '\n');
}
