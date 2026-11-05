import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import africa from '../src/data/continents/africa.json';
import america from '../src/data/continents/america.json';
import asia from '../src/data/continents/asia.json';
import type { Continent } from '../src/types/continent';
import { activitiesForEditing, descriptionForEditing, emptyOverrides, sourcesForCountryDraft, mergeSources } from '../src/services/organizerRepository';
import { defaultActivities } from '../src/services/activities';
import { OrganizerEditor } from '../src/components/OrganizerEditor';

const continents = [africa, america, asia] as Continent[];
const continent = continents[0];

it('reabre a descrição geral importada sem substituir pelo texto original', () => {
  const draft = emptyOverrides();
  draft.continents.africa = { descricao: 'Descrição importada pela professora.', fontes: ['autoral'] };
  const published = { ...continent, variantesPorAno: { geral: { descricao: 'Descrição antiga.' } } };
  expect(descriptionForEditing(published, draft, 'geral')).toBe('Descrição importada pela professora.');
  expect(descriptionForEditing(continent, draft, '4')).toBe('Descrição importada pela professora.');
});

it('mantém variantes específicas publicadas e usa o rascunho do ano quando presente', () => {
  const published = { ...continent, variantesPorAno: { '4': { descricao: 'Texto publicado para o quarto ano.' } } };
  const draft = emptyOverrides();
  draft.continents.africa = { descricao: 'Texto geral novo.', fontes: ['autoral'] };
  expect(descriptionForEditing(published, draft, '4')).toBe('Texto publicado para o quarto ano.');
  draft.continents.africa.variantesPorAno = { '4': { descricao: 'Rascunho do quarto ano.' } };
  expect(descriptionForEditing(published, draft, '4')).toBe('Rascunho do quarto ano.');
});

it('prioriza rascunho e atividade publicada antes dos padrões e mantém atividades extras', () => {
  const defaults = defaultActivities(continent, continents);
  const customized = { ...defaults[0], enunciado: 'Pergunta personalizada publicada.' };
  const extra = { ...defaults[1], id: 'africa-extra-turma', enunciado: 'Pergunta extra publicada.' };
  const draft = emptyOverrides();
  let available = activitiesForEditing(continent, continents, [customized, extra], draft);
  expect(available.find(a => a.id === customized.id)?.enunciado).toBe(customized.enunciado);
  expect(available).toContain(extra);
  expect(available.map(a => a.id)).toHaveLength(new Set(available.map(a => a.id)).size);
  draft.activities.push({ ...customized, fontes: ['natural-earth'], enunciado: 'Pergunta em rascunho.' });
  available = activitiesForEditing(continent, continents, [customized, extra], draft);
  expect(available.find(a => a.id === customized.id)?.enunciado).toBe('Pergunta em rascunho.');
});

it('abre o editor com o texto importado e a pergunta publicada, sem restaurar os padrões', () => {
  const draft = emptyOverrides();
  draft.continents.africa = { descricao: 'Texto importado mantido.', fontes: ['autoral'] };
  const published = { ...defaultActivities(continent, continents)[0], enunciado: 'Pergunta publicada mantida.' };
  const html = renderToStaticMarkup(createElement(OrganizerEditor, {
    continent, continents, activities: [published], year: 'geral', draft,
    onSave: () => {}, onCancel: () => {},
  }));
  expect(html).toContain('Texto importado mantido.');
  expect(html).toContain('Pergunta publicada mantida.');
});

it('preenche os campos do editor com imagem, áudio e dica já publicados em media/', () => {
  const published: Continent = {
    ...continent,
    fichaCurta: { ...continent.fichaCurta, ilustracao: 'media/africa-turma.svg' },
    audioUrl: 'media/africa-turma.mp3',
    dicaQr: { texto: 'Procure a folha na sala.', imagem: 'media/dica-turma.svg' },
  };
  const html = renderToStaticMarkup(createElement(OrganizerEditor, {
    continent: published, continents, activities: [], year: 'geral', draft: emptyOverrides(),
    onSave: () => {}, onCancel: () => {},
  }));
  expect(html).toContain('value="media/africa-turma.svg"');
  expect(html).toContain('value="media/africa-turma.mp3"');
  expect(html).toContain('value="media/dica-turma.svg"');
});

it('não preenche campos exclusivos de media/ com as ilustrações originais de images/', () => {
  const published: Continent = {
    ...continent,
    fichaCurta: { ...continent.fichaCurta, ilustracao: 'images/africa-original.svg' },
    dicaQr: { texto: 'Procure a folha na sala.', imagem: 'images/dica-original.svg' },
  };
  const html = renderToStaticMarkup(createElement(OrganizerEditor, {
    continent: published, continents, activities: [], year: 'geral', draft: emptyOverrides(),
    onSave: () => {}, onCancel: () => {},
  }));
  expect(html).not.toContain('value="images/africa-original.svg"');
  expect(html).not.toContain('value="images/dica-original.svg"');
});

it('abre o campo de fontes com a referência publicada do conteúdo personalizado', () => {
  const published: Continent = { ...continent, fontes: ['autoral'] };
  const html = renderToStaticMarkup(createElement(OrganizerEditor, {
    continent: published, continents, activities: [], year: 'geral', draft: emptyOverrides(),
    onSave: () => {}, onCancel: () => {},
  }));
  expect(html).toContain('value="autoral"');
  expect(html).not.toContain(`value="${continent.fontesTexto.curiosidades?.join(', ')}"`);
});

it('mantém as fontes próprias do país ao salvar com referências adicionais do continente', () => {
  const country = { ...continent.paises[0], fontes: ['natural-earth', 'autoral'] };
  const draft = emptyOverrides();
  expect(sourcesForCountryDraft(country, draft, ['ng-africa', 'autoral']))
    .toEqual(['natural-earth', 'autoral', 'ng-africa']);
  draft.countries = { [country.id]: { curiosidade: 'Texto da professora.', fontes: ['autoral'] } };
  expect(sourcesForCountryDraft(country, draft, ['ng-africa']))
    .toEqual(['autoral', 'ng-africa']);
});

it('preserva a fonte das silhuetas da atividade ao acrescentar a referência da ficha', () => {
  const activity = defaultActivities(continent, continents)[0];
  expect(mergeSources(activity.fontes, ['autoral', 'natural-earth']))
    .toEqual(['natural-earth', 'autoral']);
});
