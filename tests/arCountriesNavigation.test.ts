import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Countries from '../src/pages/Countries';
import ARExperience from '../src/pages/ARExperience';
import { useApp } from '../src/hooks/useApp';
import america from '../src/data/continents/america.json';
import europe from '../src/data/continents/europa.json';
import type { Continent } from '../src/types/continent';

vi.mock('../src/hooks/useApp', () => ({ useApp: vi.fn() }));
// Only inspect React's model selection. No camera or tracking events are emitted.
vi.mock('../src/components/ARFrame', () => ({ ARFrame: (props: { modelFile: string; countryId?: string; children: ReactNode }) =>
  createElement('div', { 'data-model': props.modelFile, 'data-country': props.countryId }, props.children),
}));
const state = { continents: [america, europe] as Continent[], unlocked: ['america','europa'], organizerPreview: false };
const render = (path: string) => {
  vi.mocked(useApp).mockReturnValue(state as unknown as ReturnType<typeof useApp>);
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(Routes, null,
      createElement(Route, {path: '/paises/:id/:countryId', element: createElement(Countries)}),
      createElement(Route, {path: '/ar/:id/:countryId?', element: createElement(ARExperience)}),
    )));
};
it('ficha abre RA do país e ambas as saídas mantêm o país selecionado', () => {
  expect(render('/paises/america/BRA')).toContain('href="/ar/america/BRA"');
  const html = render('/ar/america/BRA');
  expect(html).toContain('data-model="models/countries/BRA.glb"');
  expect(html).toContain('data-country="BRA"');
  expect(html).toContain('href="/paises/america/BRA"');
  expect(html).toContain('continente=america&amp;model=models%2Fcountries%2FBRA.glb&amp;pais=BRA');
  expect(html).toContain('Sobre Brasil');
  expect(html).not.toContain('Lugares para conhecer');
  expect(html).not.toContain('Continente descoberto!');
});
it('sem país, conserva modelo e resumo do continente; sem GLB, conserva ficha', () => {
  expect(render('/ar/america')).toContain('data-model="models/america-terrain.glb"');
  expect(render('/ar/america')).toContain('Sobre América');
  expect(render('/paises/europa/VAT')).toContain('disabled=""');
  expect(render('/ar/europa/VAT')).toContain('ainda não tem modelo 3D');
  expect(render('/ar/europa/VAT')).not.toContain('data-model');
  expect(render('/ar/america/XXX')).not.toContain('data-model');
  state.unlocked = [];
  expect(render('/ar/america/BRA')).not.toContain('data-model');
  state.unlocked = ['america','europa'];
});
