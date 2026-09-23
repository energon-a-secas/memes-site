import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bundle the actual Convex handlers; no deployment or remote data is touched.
const temp = await mkdtemp(join(tmpdir(), 'meme-backend-'));
const bundle = join(temp, 'memes.mjs');
await build({entryPoints:['convex/memes.ts'],bundle:true,platform:'node',format:'esm',outfile:bundle});
const { organize, saveMeme } = await import(pathToFileURL(bundle));
const categoryBundle = join(temp, 'categories.mjs');
await build({entryPoints:['convex/categories.ts'],bundle:true,platform:'node',format:'esm',outfile:categoryBundle});
const { create, rename, remove } = await import(pathToFileURL(categoryBundle));
after(() => rm(temp, {recursive:true,force:true}));
const previousAdmins = process.env.ADMIN_SUBJECTS;
process.env.ADMIN_SUBJECTS = 'admin';
after(() => { if (previousAdmins === undefined) delete process.env.ADMIN_SUBJECTS; else process.env.ADMIN_SUBJECTS = previousAdmins; });

function fixture(subject, {existing = null, owner = 'owner'} = {}) {
  const writes = [];
  return {
    writes,
    auth: {getUserIdentity: async () => subject ? {subject, name:'Tester'} : null},
    db: {
      get: async id => id === 'missing' ? null : ({_id:id,ownerSubject:owner}),
      patch: async (id, data) => writes.push({id,...data}),
      insert: async (table, data) => writes.push({table,...data}),
      query: () => ({withIndex: () => ({unique: async () => existing})}),
    },
  };
}
const args = {memeKey:'aun-me-queda-el-panda',category:' Team Jokes ',labels:[' #Work ', 'work']};

test('organizing requires authentication and ownership or admin rights', async () => {
  for (const subject of [null,'stranger']) {
    const ctx = fixture(subject);
    await assert.rejects(organize._handler(ctx, {...args,memeId:'upload'}));
    await assert.rejects(organize._handler(ctx, args));
    assert.equal(ctx.writes.length, 0);
  }
});

test('owner can update an upload with normalized metadata and clear its labels', async () => {
  const ctx = fixture('owner');
  await organize._handler(ctx, {...args,memeId:'upload'});
  assert.deepEqual(ctx.writes[0], {id:'upload',category:'team-jokes',labels:['work']});
  await organize._handler(ctx, {...args,memeId:'upload',labels:[]});
  assert.deepEqual(ctx.writes[1].labels, []);
});

test('legacy uploads without an owner require an admin', async () => {
  const ctx = fixture('owner', {owner:null});
  await assert.rejects(organize._handler(ctx, {...args,memeId:'upload'}));
  const admin = fixture('admin', {owner:null});
  await organize._handler(admin, {...args,memeId:'upload'});
  assert.equal(admin.writes.length, 1);
});

test('admin can insert or update bundled metadata, but cannot invent a bundled meme', async () => {
  const ctx = fixture('admin');
  await organize._handler(ctx, args);
  assert.deepEqual(ctx.writes[0], {table:'memeOrganization',memeKey:args.memeKey,category:'team-jokes',labels:['work']});
  const existing = fixture('admin', {existing:{_id:'metadata'}});
  await organize._handler(existing, args);
  assert.equal(existing.writes[0].id, 'metadata');
  await assert.rejects(organize._handler(ctx, {...args,memeKey:'does-not-exist'}));
  await assert.rejects(organize._handler(ctx, {...args,memeId:'missing'}));
});

test('invalid metadata cannot reach the database through uploads or edits', async () => {
  const ctx = fixture('admin');
  const invalid = {...args,category:'all'};
  await assert.rejects(organize._handler(ctx, invalid));
  await assert.rejects(saveMeme._handler(ctx, {...invalid,name:'test',ext:'png',storageId:'storage',displayAnonymous:true}));
  assert.equal(ctx.writes.length, 0);
});

test('upload saves labels and keeps anonymous attribution and owner identity', async () => {
  const ctx = fixture('owner');
  await saveMeme._handler(ctx, {...args,name:'test',ext:'png',storageId:'storage',displayAnonymous:true});
  assert.equal(ctx.writes[0].ownerSubject, 'owner');
  assert.equal(ctx.writes[0].displayAnonymous, true);
  assert.deepEqual(ctx.writes[0].labels, ['work']);
});

// ── Category administration ──────────────────────────────────────────
// A store backed by plain arrays, so a rename can be checked for what it wrote
// as well as for what it claimed to move.
function store(subject, tables = {}) {
  const data = {memes: [], memeOrganization: [], categories: [], ...tables};
  const row = id => Object.values(data).flat().find(item => item._id === id);
  return {
    data,
    auth: {getUserIdentity: async () => subject ? {subject, name:'Tester'} : null},
    db: {
      query: table => ({
        collect: async () => [...data[table]],
        withIndex: (_index, build) => {
          const terms = {};
          const q = {eq(field, value) { terms[field] = value; return q; }};
          build(q);
          const matches = data[table].filter(item => Object.entries(terms).every(([k, v]) => item[k] === v));
          return {unique: async () => matches[0] ?? null, first: async () => matches[0] ?? null, collect: async () => matches};
        },
      }),
      patch: async (id, patch) => Object.assign(row(id), patch),
      insert: async (table, item) => {
        const created = {_id: `${table}:${data[table].length}`, ...item};
        data[table].push(created);
        return created._id;
      },
      delete: async id => { for (const list of Object.values(data)) {
        const at = list.findIndex(item => item._id === id);
        if (at >= 0) list.splice(at, 1);
      } },
    },
  };
}

// data.js ships eight bundled memes under "anime"; a rename that misses them is
// the failure this whole helper exists to catch.
const BUNDLED_ANIME = 8;

test('only an admin can create, rename or remove a category', async () => {
  for (const subject of [null, 'stranger']) {
    const ctx = store(subject);
    await assert.rejects(create._handler(ctx, {name:'new-one'}));
    await assert.rejects(rename._handler(ctx, {from:'anime', to:'cartoons'}));
    await assert.rejects(remove._handler(ctx, {name:'anime'}));
    assert.deepEqual(ctx.data.categories, []);
    assert.deepEqual(ctx.data.memeOrganization, []);
  }
});

test('creating a category normalizes it and refuses one that already exists', async () => {
  const ctx = store('admin');
  assert.equal(await create._handler(ctx, {name:'  Team  Jokes '}), 'team-jokes');
  assert.equal(ctx.data.categories[0].name, 'team-jokes');
  await assert.rejects(create._handler(ctx, {name:'Team Jokes'}), /already exists/);
  // Implicit categories count as existing, whether bundled or carried by an upload.
  await assert.rejects(create._handler(ctx, {name:'anime'}), /already exists/);
  await assert.rejects(create._handler(ctx, {name:'all'}));
});

test('renaming moves uploads, saved rows and bundled memes that have no row yet', async () => {
  const ctx = store('admin', {
    memes: [{_id:'m1', category:'anime'}, {_id:'m2', category:'games'}],
    memeOrganization: [{_id:'o1', memeKey:'avatar-no-war', category:'anime', labels:['war']}],
    categories: [{_id:'c1', name:'anime'}],
  });
  const result = await rename._handler(ctx, {from:'Anime', to:' Japanese Animation '});
  assert.equal(result.to, 'japanese-animation');

  assert.equal(ctx.data.memes.find(m => m._id === 'm1').category, 'japanese-animation');
  assert.equal(ctx.data.memes.find(m => m._id === 'm2').category, 'games', 'other categories stay put');
  // The row that already existed is patched, never duplicated, and keeps its labels.
  const moved = ctx.data.memeOrganization.find(o => o.memeKey === 'avatar-no-war');
  assert.deepEqual([moved.category, moved.labels], ['japanese-animation', ['war']]);
  assert.equal(ctx.data.memeOrganization.filter(o => o.memeKey === 'avatar-no-war').length, 1);
  // Every bundled anime meme without a row gets one, so none is left behind in data.js.
  assert.equal(ctx.data.memeOrganization.length, BUNDLED_ANIME);
  assert.equal(result.moved, 1 + BUNDLED_ANIME);
  assert.equal(ctx.data.categories[0].name, 'japanese-animation');
});

test('renaming onto an existing name merges instead of leaving two rows', async () => {
  const ctx = store('admin', {categories: [{_id:'c1', name:'sketches'}, {_id:'c2', name:'templates'}]});
  await rename._handler(ctx, {from:'sketches', to:'templates'});
  assert.deepEqual(ctx.data.categories.map(c => c.name), ['templates']);
  const unchanged = store('admin', {categories: [{_id:'c1', name:'sketches'}]});
  assert.equal((await rename._handler(unchanged, {from:'sketches', to:'Sketches'})).moved, 0);
  assert.equal(unchanged.data.categories[0].name, 'sketches');
});

test('removing a category sends its memes to general and refuses to remove general', async () => {
  const ctx = store('admin', {
    memes: [{_id:'m1', category:'anime'}],
    categories: [{_id:'c1', name:'anime'}],
  });
  const result = await remove._handler(ctx, {name:'anime'});
  assert.deepEqual([result.movedTo, result.moved], ['general', 1 + BUNDLED_ANIME]);
  assert.equal(ctx.data.memes[0].category, 'general');
  assert.deepEqual(ctx.data.categories, []);
  assert.ok(ctx.data.memeOrganization.every(o => o.category === 'general'));
  await assert.rejects(remove._handler(store('admin'), {name:'General'}), /cannot be removed/);
});
