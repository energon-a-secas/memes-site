import { state } from './state.js';
import { normalizeCategory, normalizeLabel, MAX_CATEGORY_LENGTH, MAX_LABEL_LENGTH, MAX_LABELS } from './organization.js';
import { updateQuery, createQueryHistory } from './neorgon-navigation.js';

export function readBrowseState(href) {
  const params = new URL(href).searchParams;
  const category = normalizeCategory(params.get('cat') || 'all');
  return {
    searchQuery: (params.get('q') || '').trim().slice(0, 300),
    activeCategory: category && category.length <= MAX_CATEGORY_LENGTH ? category : 'all',
    activeLabels: new Set(params.getAll('label').map(normalizeLabel).filter(label => label && label.length <= MAX_LABEL_LENGTH).slice(0, MAX_LABELS)),
    sortBy: ['recent', 'default', 'votes', 'name'].includes(params.get('sort')) ? params.get('sort') : 'recent',
  };
}

export function urlForBrowseState(href, current) {
  const values = { q: current.searchQuery.trim(), cat: current.activeCategory === 'all' ? '' : current.activeCategory,
    sort: current.sortBy === 'recent' ? '' : current.sortBy, label: [...current.activeLabels].sort() };
  return updateQuery(href, values);
}

export function restoreBrowseState() {
  Object.assign(state, readBrowseState(location.href));
  document.getElementById('searchInput').value = state.searchQuery;
  document.getElementById('sortSelect').value = state.sortBy;
}

export const navigation = createQueryHistory(href => urlForBrowseState(href, state));
