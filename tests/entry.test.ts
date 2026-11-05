import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { entryRedirect, initialDestination } from '../src/hooks/useJourney';
import { useApp } from '../src/hooks/useApp';
import { DiscoveryProgress } from '../src/components/DiscoveryProgress';
import { WorldMap } from '../src/components/WorldMap';
import { CameraShortcut } from '../src/components/CameraShortcut';
import africa from '../src/data/continents/africa.json';

vi.mock('../src/hooks/useApp', () => ({ useApp: vi.fn() }));

it('cada abertura exige perfil e instruções, inclusive rotas de câmera e destinos de QR', () => {
  for (const path of ['/mapa', '/continente/africa', '/qr/africa', '/ar/africa', '/organizador', '/configuracoes']) {
    expect(entryRedirect(path, null, false, false)).toBe('/');
  }
  expect(entryRedirect('/mapa', 'explorer', false, false)).toBe('/orientacao');
  expect(entryRedirect('/qr/africa', 'explorer', false, false)).toBe('/orientacao');
  expect(entryRedirect('/orientacao', 'explorer', false, false)).toBeNull();
  expect(entryRedirect('/mapa', 'explorer', true, false)).toBeNull();
  expect(entryRedirect('/organizador', 'organizer', false, false)).toBeNull();
  expect(entryRedirect('/mapa', 'organizer', false, false)).toBe('/organizador');
  expect(entryRedirect('/mapa', 'organizer', false, true)).toBeNull();
  expect(initialDestination('?continente=africa', '')).toBe('africa');
  expect(initialDestination('?continente=invalid', '')).toBeUndefined();
  expect(initialDestination('', '#/continente/antartida')).toBe('antartida');
  expect(initialDestination('', '#/qr/invalid')).toBeUndefined();
});

it('barra e percentual usam descobertas reais; mapa de fundo não tem controles ocultos', () => {
  const state = { unlocked: [], completed: ['africa-reconhecer-formato'], continents: [africa] };
  vi.mocked(useApp).mockReturnValue(state as unknown as ReturnType<typeof useApp>);
  const renderProgress = () => renderToStaticMarkup(createElement(DiscoveryProgress));
  expect(renderProgress()).toContain('value="0"');
  expect(renderProgress()).toContain('0%');
  vi.mocked(useApp).mockReturnValue({ ...state, unlocked: ['africa', 'america'] } as unknown as ReturnType<typeof useApp>);
  expect(renderProgress()).toContain('33%');
  expect(renderProgress()).toContain('value="2"');
  const background = renderToStaticMarkup(createElement(WorldMap, { decorative: true }));
  expect(background).not.toContain('tabindex');
  expect(background).not.toContain('role="button"');
  expect(background).not.toContain('map-places');
  const shortcut = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(CameraShortcut)));
  expect(shortcut).toContain('Ler QR Code');
  expect(shortcut).not.toContain('<video');
});
