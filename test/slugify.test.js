import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.js';

test('slugify converts basic text into a URL-friendly slug', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});

test('slugify collapses spaces punctuation and underscores into one dash', () => {
  assert.equal(
    slugify('  many   spaces__and--dashes  '),
    'many-spaces-and-dashes'
  );
});

test('slugify removes accents', () => {
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});

test('slugify transliterates common latin compatibility letters', () => {
  assert.equal(slugify('Æther & straße'), 'aether-strasse');
});

test('slugify returns an empty string for empty or punctuation-only input', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify('!!!'), '');
});

test('slugify throws a TypeError for non-string input', () => {
  assert.throws(
    () => slugify(42),
    new TypeError('slugify expects a string')
  );
});
