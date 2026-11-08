// The bundled memes come from references-api's catalogue (scripts/sync-catalogue.mjs).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { CATEGORIES, MEMES } from '../js/data.js';
import { CATALOGUE, DATA_PATH, ROOT, readCatalogue, render } from '../scripts/sync-catalogue.mjs';

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

test('every bundled meme is a file here, and every file is a bundled meme', () => {
  const listed = new Set(MEMES.map((meme) => meme.path));
  for (const path of listed) assert.ok(existsSync(join(ROOT, path)), `missing file for ${path}`);
  const onDisk = files(join(ROOT, 'assets/images'))
    .map((full) => relative(ROOT, full))
    .filter((path) => !path.split('/').pop().startsWith('.'));
  const orphans = onDisk.filter((path) => !listed.has(path));
  assert.deepEqual(orphans, [], 'add these to the catalogue in references-api, or delete them');
});

test('names are unique, ids count up, and every category is listed', () => {
  assert.equal(new Set(MEMES.map((meme) => meme.name)).size, MEMES.length);
  assert.deepEqual(MEMES.map((meme) => meme.id), MEMES.map((_, index) => index + 1));
  for (const meme of MEMES) {
    assert.ok(CATEGORIES.includes(meme.category), `${meme.name}: ${meme.category}`);
    assert.equal(meme.ext, meme.path.split('.').pop().toLowerCase(), meme.name);
  }
});

test('js/data.js matches the catalogue', (t) => {
  const catalogue = readCatalogue();
  if (!catalogue) return t.skip(`no catalogue at ${CATALOGUE}; this check runs inside the monorepo`);
  assert.equal(readFileSync(join(ROOT, DATA_PATH), 'utf8'), render(catalogue), 'run: make catalogue');
});
