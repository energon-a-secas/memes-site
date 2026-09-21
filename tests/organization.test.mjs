import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOrganization, selectMemes, categoryName } from '../js/organization.js';

const memes = [
  { id: 1, name: 'homer-at-work', category: 'simpsons', labels: ['work', 'reaction'] },
  { id: 2, name: 'homer-at-home', category: 'simpsons', labels: ['reaction'] },
  { id: 3, name: 'office-cat', category: 'general', labels: ['work'], _creationTime: 100 },
];

test('custom categories and pasted labels normalize and deduplicate', () => {
  assert.deepEqual(validateOrganization(' Team__Jokes ', [' #Work ', 'work', '  inside   joke  ', 'ＷＯＲＫ', '']), {
    category: 'team-jokes', labels: ['work', 'inside joke'],
  });
  assert.equal(categoryName('team-jokes'), 'Team Jokes');
  assert.equal(validateOrganization('The Simpsons', []).category, 'simpsons');
  assert.equal(validateOrganization('Movies', []).category, 'movie-reference');
});

test('empty, reserved and oversized metadata is rejected; labels can be cleared', () => {
  for (const category of ['', '  ', 'ALL', 'a'.repeat(41)]) assert.throws(() => validateOrganization(category, []));
  assert.throws(() => validateOrganization('general', ['a'.repeat(33)]));
  assert.throws(() => validateOrganization('general', Array.from({length: 9}, (_, i) => `label ${i}`)));
  assert.deepEqual(validateOrganization('general', []), {category:'general', labels:[]});
});

test('category, all selected labels and search terms combine', () => {
  assert.deepEqual(selectMemes(memes, {category:'simpsons', labels:['work','reaction'], query:'homer'}).map(m=>m.id), [1]);
  assert.equal(selectMemes(memes, {category:'general', labels:['reaction']}).length, 0);
  assert.equal(selectMemes(memes, {query:'The Simpsons reaction'}).length, 2);
});

test('sorts votes, upload recency and names without mutating the collection', () => {
  assert.equal(selectMemes(memes)[0].id, 3);
  assert.equal(selectMemes(memes, {sort:'votes', votes:{'homer-at-home':5}})[0].id, 2);
  assert.equal(selectMemes(memes, {sort:'name'})[0].id, 2);
  assert.deepEqual(memes.map(m=>m.id), [1,2,3]);
});

test('legacy memes without labels still match category and text searches', () => {
  assert.equal(selectMemes([{id:1,name:'old-meme',category:'general'}], {query:'old meme'}).length, 1);
  assert.equal(selectMemes([{id:1,name:'old-meme',category:'general'}], {labels:['work']}).length, 0);
});
