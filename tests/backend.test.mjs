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
const { list, organize, saveMeme } = await import(pathToFileURL(bundle));
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

// ── The public list ──────────────────────────────────────────────────
// memes:list answers every visitor. A stored row also holds the uploader's
// name, account id and storage id; each one would link anonymous uploads to
// their uploader and to each other.
const UPLOADS = [
  {_id:'m1',_creationTime:3,name:'team-reaction',category:'general',labels:['work'],ext:'png',storageId:'kg_storage_secret',uploadedBy:'Real Uploader',displayAnonymous:true,ownerSubject:'user_owner_secret'},
  {_id:'m2',_creationTime:2,name:'game-night',category:'games',ext:'jpg',storageId:'kg_other_storage',uploadedBy:'Tomás',displayAnonymous:false,ownerSubject:'user_other_secret'},
  {_id:'m3',_creationTime:1,name:'legacy',category:'general',ext:'gif',storageId:'kg_legacy_storage',uploadedBy:'Member',displayAnonymous:true},
  {_id:'m4',_creationTime:0,name:'file-gone',category:'general',ext:'png',storageId:'kg_gone',uploadedBy:'Member',displayAnonymous:true,ownerSubject:'user_owner_secret'},
];
// Storage URLs are opaque, like Convex's, so they carry no storage id.
const URLS = {kg_storage_secret:'https://example.convex.cloud/api/storage/0001', kg_other_storage:'https://example.convex.cloud/api/storage/0002', kg_legacy_storage:'https://example.convex.cloud/api/storage/0003'};
const PUBLIC_FIELDS = ['_creationTime','_id','category','displayName','ext','labels','mine','name','url'];

function listContext(subject) {
  return {
    auth: {getUserIdentity: async () => subject ? {subject, name:'Tester'} : null},
    db: {query: table => {
      assert.equal(table, 'memes');
      return {order: () => ({collect: async () => structuredClone(UPLOADS)})};
    }},
    storage: {getUrl: async id => URLS[id] ?? null},
  };
}

test('the public list sends only what the page shows, never who uploaded a meme', async () => {
  for (const subject of [null, 'user_owner_secret', 'user_other_secret']) {
    const rows = await list._handler(listContext(subject), {});
    assert.deepEqual(rows.map(row => row._id), ['m1','m2','m3'], 'a meme whose file is gone is left out');
    for (const row of rows) assert.deepEqual(Object.keys(row).sort(), PUBLIC_FIELDS);
    const text = JSON.stringify(rows);
    for (const secret of ['Real Uploader','user_owner_secret','user_other_secret','kg_storage_secret','kg_other_storage','kg_legacy_storage']) {
      assert.ok(!text.includes(secret), `${secret} reached a visitor signed in as ${subject}`);
    }
  }
});

test('mine marks only the caller\'s own uploads; an upload with no owner is nobody\'s', async () => {
  const mine = async subject => Object.fromEntries((await list._handler(listContext(subject), {})).map(row => [row._id, row.mine]));
  assert.deepEqual(await mine(null), {m1:false,m2:false,m3:false});
  assert.deepEqual(await mine('user_owner_secret'), {m1:true,m2:false,m3:false});
  assert.deepEqual(await mine('user_other_secret'), {m1:false,m2:true,m3:false});
});

test('the list credits uploaders as they chose and always sends labels as a list', async () => {
  const rows = await list._handler(listContext(null), {});
  assert.deepEqual(rows.map(row => row.displayName), ['Anon','Tomás','Anon']);
  assert.deepEqual(rows.map(row => row.labels), [['work'],[],[]]);
  assert.equal(rows[0].url, URLS.kg_storage_secret);
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
