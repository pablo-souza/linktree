/** Converte CSV em registros usando a primeira linha como cabeçalho. */
export function parseCsv(input) {
  if (typeof input !== 'string' || input.length === 0) return [];

  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field === '') quoted = true;
    else if (character === ',') { row.push(field); field = ''; }
    else if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }

  row.push(field);
  if (row.some((value) => value !== '')) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows.shift().map((header, index) => {
    const cleanHeader = index === 0 ? header.replace(/^\uFEFF/, '') : header;
    return cleanHeader.trim();
  });

  return rows.map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? '']),
  ));
}
