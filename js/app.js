import { APP_CONFIG } from './config.js';
import { parseCsv } from './csv.js';
import { normalizeConfig, normalizeLinks, validateImageUrl } from './validators.js';

const ICONS = Object.freeze({
  instagram: '◎', whatsapp: '◉', youtube: '▶', github: '⌘',
  linkedin: 'in', globe: '◌', email: '✉', link: '↗',
});

const elements = {
  profile: document.querySelector('#profile'),
  avatar: document.querySelector('#profile-avatar'),
  title: document.querySelector('#profile-title'),
  description: document.querySelector('#profile-description'),
  status: document.querySelector('#status'),
  list: document.querySelector('#link-list'),
  retry: document.querySelector('#retry-button'),
  footer: document.querySelector('#footer'),
};

export async function fetchSheet(url) {
  if (!url || url.startsWith('URL_PUBLICA_')) throw new Error('Configure as URLs públicas em js/config.js.');
  const requestUrl = new URL(url);
  requestUrl.searchParams.set('_ts', Date.now().toString());
  const response = await fetch(requestUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Falha ao buscar planilha: HTTP ${response.status}.`);
  return parseCsv(await response.text());
}

function setState(state) {
  const messages = {
    loading: 'Carregando...',
    empty: 'Nenhum link disponível no momento.',
    error: 'Não foi possível carregar os links. Tente novamente mais tarde.',
  };
  elements.status.textContent = messages[state] ?? '';
  elements.status.hidden = state === 'success';
  elements.list.hidden = state !== 'success';
  elements.retry.hidden = state !== 'error';
}

function renderProfile(config) {
  const title = config.title || 'Meus links';
  elements.title.textContent = title;
  document.title = title;
  elements.description.textContent = config.description || '';
  elements.description.hidden = !config.description;
  elements.avatar.src = validateImageUrl(config.avatar) || './assets/default-avatar.svg';
  elements.avatar.alt = config.avatar ? `Avatar de ${title}` : '';
  elements.avatar.onerror = () => { elements.avatar.src = './assets/default-avatar.svg'; elements.avatar.alt = ''; };
  elements.profile.hidden = false;
}

function renderLinks(links) {
  elements.list.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const link of links) {
    const anchor = document.createElement('a');
    anchor.className = `link-card${link.highlight ? ' link-card--highlight' : ''}`;
    anchor.href = link.url;
    if (link.url.startsWith('http:') || link.url.startsWith('https:')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }

    const icon = document.createElement('span');
    icon.className = 'link-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICONS[link.icon] || ICONS.link;
    const title = document.createElement('span');
    title.className = 'link-card__title';
    title.textContent = link.title;
    const arrow = document.createElement('span');
    arrow.className = 'link-card__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    anchor.append(icon, title, arrow);
    fragment.append(anchor);
  }
  elements.list.append(fragment);
}

function renderFooter(config) {
  elements.footer.textContent = config.footer || '';
  elements.footer.hidden = !config.footer;
}

export async function loadApp() {
  setState('loading');
  try {
    const [configRows, linkRows] = await Promise.all([
      fetchSheet(APP_CONFIG.configSheetUrl),
      fetchSheet(APP_CONFIG.linksSheetUrl),
    ]);
    const config = normalizeConfig(configRows);
    const links = normalizeLinks(linkRows);
    renderProfile(config);
    renderLinks(links);
    renderFooter(config);
    setState(links.length ? 'success' : 'empty');
  } catch (error) {
    console.error('Erro ao carregar a página:', error);
    setState('error');
  }
}

elements.retry.addEventListener('click', loadApp);
loadApp();
