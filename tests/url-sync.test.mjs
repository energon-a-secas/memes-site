import test from 'node:test';
import assert from 'node:assert/strict';
import { readBrowseState, urlForBrowseState } from '../js/url-sync.js';

test('share URLs retain custom categories and repeated labels before remote data arrives', () => {
  const state = readBrowseState('https://memes.test/?cat=Office+Life&label=%23Work&label=work&label=home%2C+too&q=team&sort=name');
  assert.equal(state.activeCategory,'office-life');
  assert.deepEqual([...state.activeLabels],['work','home, too']);
  const url = urlForBrowseState('https://memes.test/?theme=rain&utm=a&utm=b#main',state);
  assert.equal(url.searchParams.get('theme'),'rain');
  assert.deepEqual(url.searchParams.getAll('utm'),['a','b']);
  assert.equal(url.hash,'#main');
  assert.deepEqual(readBrowseState(url),state);
});

test('URL validation bounds labels and search, and missing fields restore defaults', () => {
  const url = new URL('https://memes.test/');
  url.searchParams.set('q','a'.repeat(500));
  url.searchParams.set('cat','x'.repeat(80));
  url.searchParams.set('sort','unknown');
  for (let n=0;n<20;n++) url.searchParams.append('label','tag'+n);
  const result = readBrowseState(url);
  assert.equal(result.searchQuery.length,300);
  assert.equal(result.activeCategory,'all');
  assert.equal(result.sortBy,'recent');
  assert.equal(result.activeLabels.size,8);
  assert.deepEqual(readBrowseState('https://memes.test/'),{
    searchQuery:'',activeCategory:'all',activeLabels:new Set(),sortBy:'recent',
  });
});
