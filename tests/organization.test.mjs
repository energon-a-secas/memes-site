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

test('a typo still finds the meme, but only once the word is long enough to risk one', () => {
  assert.equal(selectMemes(memes, {query:'simsons'}).length, 2);       // simpsons, one deletion
  assert.equal(selectMemes(memes, {query:'ofice cat'})[0].id, 3);      // office, one deletion
  assert.equal(selectMemes(memes, {query:'homerr'})[0].id, 1);
  assert.equal(selectMemes(memes, {query:'simpsosn'}).length, 2);  // a swapped pair is one typo, not two
  // Three letters get no allowance at all, or every short word matches everything.
  assert.equal(selectMemes(memes, {query:'cot'}).length, 0);
  assert.equal(selectMemes(memes, {query:'zzzzzzzz'}).length, 0);
});

test('accents fold away in both directions', () => {
  const accented = [{id:1, name:'mañana-cubre-turno', category:'other-references', labels:['día']}];
  assert.equal(selectMemes(accented, {query:'manana'}).length, 1);
  assert.equal(selectMemes(accented, {query:'mañana'}).length, 1);
  assert.equal(selectMemes(accented, {query:'dia'}).length, 1);
});

test('a query ranks by where it matched, and the sort control breaks the ties', () => {
  const ranked = [
    {id:1, name:'office-party', category:'general', labels:[]},
    {id:2, name:'homer-donut', category:'general', labels:['office']},
    {id:3, name:'cat-nap', category:'office-life', labels:[]},
  ];
  // Name beats label beats category, whatever order they arrive in.
  assert.deepEqual(selectMemes(ranked, {query:'office'}).map(m=>m.id), [1, 2, 3]);
  // An exact token outranks a mere substring of a longer word.
  assert.deepEqual(selectMemes([
    {id:1, name:'officer-down', category:'general', labels:[]},
    {id:2, name:'the-office', category:'general', labels:[]},
  ], {query:'office'}).map(m=>m.id), [2, 1]);
  // Without a query the chosen sort is untouched.
  assert.deepEqual(selectMemes(ranked, {sort:'name'}).map(m=>m.id), [3, 2, 1]);
});

test('every word must still land somewhere, and the raw slug stays searchable', () => {
  assert.equal(selectMemes(memes, {query:'homer office'}).length, 0);
  assert.equal(selectMemes(memes, {query:'homer-at-work'})[0].id, 1);
  assert.equal(selectMemes(memes, {query:'   '}).length, memes.length);
});
