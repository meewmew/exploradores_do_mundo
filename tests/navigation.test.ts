import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { useApp } from '../src/hooks/useApp';
import ContinentPage, { Datum } from '../src/pages/Continent';
import ARExperience from '../src/pages/ARExperience';
import africa from '../src/data/continents/africa.json';
import antarctica from '../src/data/continents/antartida.json';
import type { Continent, ContinentId } from '../src/types/continent';

vi.mock('../src/hooks/useApp', () => ({ useApp: vi.fn(), repository: {} }));

// Renderização de HTML verifica a decisão da tela; não executa câmera nem WebGL.
it('fichas respeitam bloqueio, confirmação do QR, Antártida e resumo sobreposto da RA', () => {
  const state = {
    continents: [africa, antarctica] as Continent[], activities: [], unlocked: [] as ContinentId[],
    completed: [], year: 'geral' as const, ready: true, warning: '', organizerPreview: false, progressPersistent: true,
    refresh: async () => {}, setYear: async () => {}, previewDraft: () => {},
  };
  vi.mocked(useApp).mockImplementation(() => state);
  const render = (path: string, ar = false, publicView = false) => renderToStaticMarkup(createElement(MemoryRouter,
    { initialEntries: [{ pathname: path, state: { discovered: true, organizerPublicView: publicView } }] },
    createElement(Routes, null, createElement(Route, {
      path: ar ? '/ar/:id' : '/continente/:id', element: createElement(ar ? ARExperience : ContinentPage),
    })),
  ));
  const locked = render('/continente/africa');
  expect(locked).toContain('Escanear QR code');
  expect(locked).not.toContain('model-panel');
  expect(locked).not.toContain('Continente descoberto!');
  expect(render('/ar/africa', true)).not.toContain('class="ar-fact"');
  state.unlocked = ['africa', 'antartida'];
  const discovered = render('/continente/africa');
  expect(discovered).toContain('Continente descoberto!');
  expect(discovered).toContain('Conhecer os países');
  expect(discovered).toContain('Fazer atividade');
  expect(render('/continente/africa', false, true)).toContain('Voltar ao Organizador');
  expect(render('/continente/antartida')).not.toContain('Conhecer os países');
  const ar = render('/ar/africa', true);
  expect(ar).toContain('class="ar-fact"');
  expect(ar).toContain(africa.fichaCurta.localizacao);
  expect(ar).toContain('Ver sem câmera');
  expect(renderToStaticMarkup(createElement(Datum, { label: 'Área', data: { valor: 123, verificar: true, fonte: 'autoral' } }))).toContain('Dado em verificação');
});
