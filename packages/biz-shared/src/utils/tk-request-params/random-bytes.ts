export function randomBytes(size: number) {
  if (typeof globalThis.crypto !== 'undefined') {
    // Browser environment
    const array = new Uint8Array(size);
    globalThis.crypto.getRandomValues(array);
    return array;
  } else {
    // Node.js environment
    // eslint-disable-next-line ts/no-require-imports
    return require('node:crypto').randomBytes(size);
  }
}
