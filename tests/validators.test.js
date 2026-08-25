import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig, normalizeLinks, parseBoolean, validateImageUrl, validateUrl } from '../js/validators.js';

test('interpreta valores booleanos aceitos', () => {
  for (const value of ['TRUE', 'true', '1', 'sim', 'yes']) assert.equal(parseBoolean(value), true);
  for (const value of ['FALSE', 'false', '0', 'não', 'nao', 'no']) assert.equal(parseBoolean(value, true), false);
});

test('aceita somente protocolos de link permitidos', () => {
  for (const url of ['https://example.com', 'http://example.com', 'mailto:contato@example.com', 'tel:+551499999999']) {
    assert.ok(validateUrl(url));
  }
  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', '', 'site sem protocolo']) {
    assert.equal(validateUrl(url), null);
  }
});

test('imagem aceita somente HTTP e HTTPS', () => {
  assert.ok(validateImageUrl('https://example.com/avatar.jpg'));
  assert.equal(validateImageUrl('data:image/svg+xml,x'), null);
  assert.equal(validateImageUrl('mailto:a@b.com'), null);
});

test('normaliza apenas configurações conhecidas', () => {
  assert.deepEqual(normalizeConfig([{ key: ' title ', value: ' Perfil ' }, { key: 'secret', value: 'x' }]), { title: 'Perfil' });
});

test('filtra e ordena links, deixando ordem inválida por último', () => {
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    const links = normalizeLinks([
      { order: 'x', title: 'Último', url: 'https://example.com/3', enabled: 'yes' },
      { order: '2', title: 'Segundo', url: 'https://example.com/2', enabled: 'TRUE', highlight: 'sim' },
      { order: '1', title: 'Primeiro', url: 'https://example.com/1', enabled: '1' },
      { order: '0', title: 'Oculto', url: 'https://example.com', enabled: 'FALSE' },
      { order: '3', title: '', url: 'https://example.com', enabled: 'TRUE' },
      { order: '4', title: 'Perigoso', url: 'javascript:alert(1)', enabled: 'TRUE' },
    ]);
    assert.deepEqual(links.map(({ title }) => title), ['Primeiro', 'Segundo', 'Último']);
    assert.equal(links[1].highlight, true);
    assert.equal(links[2].order, null);
  } finally { console.warn = originalWarn; }
});
