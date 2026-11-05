import { expect, it } from 'vitest';
import { constrainMap, moveMap, zoomMap } from '../src/services/mapViewport';

it('zoom preserva o ponto focal e limita ampliação e arraste aos limites do mapa', () => {
  const size = { width: 1000, height: 510 };
  expect(zoomMap({ scale: 1, x: 0, y: 0 }, 2, size, { x: 100, y: 50 })).toEqual({ scale: 2, x: -100, y: -50 });
  expect(constrainMap({ scale: 20, x: 90000, y: -90000 }, size)).toEqual({ scale: 5, x: 2000, y: -1020 });
  expect(constrainMap({ scale: .1, x: 100, y: 100 }, size)).toEqual({ scale: 1, x: 0, y: 0 });
});

it('pinça amplia sem salto ao trocar de dois dedos para um e arraste move o mapa', () => {
  const size = { width: 1000, height: 510 }, initial = { scale: 2, x: 0, y: 0 };
  const before = [{ id: 1, x: -50, y: 0 }, { id: 2, x: 50, y: 0 }];
  const next = [{ id: 1, x: -100, y: 0 }, { id: 2, x: 100, y: 0 }];
  expect(moveMap(initial, before, next, size).scale).toBe(4);
  expect(moveMap(initial, before, [next[0]], size)).toEqual(initial);
  expect(moveMap(initial, [next[0]], [{ ...next[0], x: -80, y: 30 }], size)).toEqual({ scale: 2, x: 20, y: 30 });
});
