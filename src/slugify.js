const CHARACTER_REPLACEMENTS = {
  'Æ': 'AE',
  'æ': 'ae',
  'Ð': 'D',
  'ð': 'd',
  'Ø': 'O',
  'ø': 'o',
  'Þ': 'TH',
  'þ': 'th',
  'ẞ': 'SS',
  'ß': 'ss'
};

export function slugify(text) {
  if (typeof text !== 'string') {
    throw new TypeError('slugify expects a string');
  }

  return text
    .replace(/[ÆæÐðØøÞþẞß]/g, (character) => CHARACTER_REPLACEMENTS[character])
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
