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
