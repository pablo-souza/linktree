import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../js/csv.js';

test('converte CSV simples em registros', () => {
  assert.deepEqual(parseCsv('name,url\nSite,https://example.com'), [{ name: 'Site', url: 'https://example.com' }]);
});

test('aceita vírgula, quebra de linha e aspas escapadas em campos entre aspas', () => {
  const csv = 'title,description\r\n"Instagram, fotos","Texto com\nlinha e ""aspas"""\r\n';
  assert.deepEqual(parseCsv(csv), [{ title: 'Instagram, fotos', description: 'Texto com\nlinha e "aspas"' }]);
});

test('preserva campos vazios e ignora linhas vazias', () => {
  assert.deepEqual(parseCsv('a,b,c\n1,,3\n\n'), [{ a: '1', b: '', c: '3' }]);
});

test('remove BOM do primeiro cabeçalho', () => {
  assert.deepEqual(parseCsv('\uFEFFkey,value\ntitle,Teste'), [{ key: 'title', value: 'Teste' }]);
});
