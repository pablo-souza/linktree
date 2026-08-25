const TRUE_VALUES = new Set(['true', '1', 'sim', 'yes']);
const FALSE_VALUES = new Set(['false', '0', 'não', 'nao', 'no']);
const CONFIG_KEYS = new Set(['title', 'description', 'avatar', 'footer', 'theme']);
const LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const IMAGE_PROTOCOLS = new Set(['http:', 'https:']);

export function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('pt-BR');
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return fallback;
}

export function validateUrl(value, protocols = LINK_PROTOCOLS) {
  const candidate = String(value ?? '').trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return protocols.has(url.protocol.toLowerCase()) ? url.href : null;
  } catch {
    return null;
  }
}

export function validateImageUrl(value) {
  return validateUrl(value, IMAGE_PROTOCOLS);
}

export function normalizeConfig(rows) {
  const config = {};
  for (const row of rows) {
    const key = String(row.key ?? '').trim().toLowerCase();
    if (CONFIG_KEYS.has(key)) config[key] = String(row.value ?? '').trim();
  }
  return config;
}

export function normalizeLinks(rows) {
  return rows.flatMap((row, index) => {
    const title = String(row.title ?? '').trim();
    const url = validateUrl(row.url);
    if (!title || !url) {
      console.warn(`Link ignorado na linha ${index + 2}: título ou URL inválida.`);
      return [];
    }
    if (!parseBoolean(row.enabled)) return [];

    const parsedOrder = Number(String(row.order ?? '').trim());
    return [{
      order: Number.isFinite(parsedOrder) && String(row.order ?? '').trim() !== '' ? parsedOrder : null,
      sourceIndex: index,
      title,
      url,
      icon: String(row.icon ?? '').trim().toLowerCase(),
      enabled: true,
      highlight: parseBoolean(row.highlight),
    }];
  }).sort((left, right) => {
    if (left.order === null && right.order !== null) return 1;
    if (left.order !== null && right.order === null) return -1;
    if (left.order !== right.order) return (left.order ?? 0) - (right.order ?? 0);
    return left.sourceIndex - right.sourceIndex;
  });
}
