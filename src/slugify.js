export function slugify(text) {
  if (typeof text !== 'string') {
    throw new TypeError('slugify expects a string');
  }

  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
