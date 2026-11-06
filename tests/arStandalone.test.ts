import { expect, it } from 'vitest';
import * as standalone from '../src/services/arStandalone';
import { readFile } from 'node:fs/promises';

it('a cena em página inteira oferece modelos e gestos sem acesso ao repositório de progresso', async () => {
  expect(Object.keys(standalone).sort()).toEqual(['applyARTransformAction','arCountry','initialARTransform','isARModelAllowed','updateARGesture']);
  const scene = await readFile('public/ar/scene.js', 'utf8');
  expect(scene).not.toMatch(/discoverFromMarker|createStandaloneRepository|localStorage|\.unlock\(/);
});
