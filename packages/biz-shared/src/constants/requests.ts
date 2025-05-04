/** 为了混淆，不直接写出字符串，让更难破解 */

/* eslint-disable unicorn/number-literal-case */
const _p1 = 'abcdefghijklmnopqrstuvwxyz';
const _p2 = '-!@#$%^&*()_+=[]{}|;:,.<>?';

function xor(idx: number): number {
  return idx ^ 0x7f;
}

function findChar(idx: number): string {
  const _i = xor(idx);
  return _i < _p1.length ? _p1.charAt(_i) : _p2.charAt(_i - _p1.length);
}

function numbersToString(indices: number[]): string {
  return indices.map(xor).map(findChar).join('');
}

// Obfuscated header keys
export const CLIENT_TOKEN_HEADER_KEY: string = numbersToString([
  23, 26, 19, 10, 2, 26, 19, 14, 10, 4, 13,
]); // x-tkc-token

export const SYSTEM_TOKEN_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 26, 18, 24, 18, 26, 19, 14, 10, 4, 13,
]); // x-tk-sys-token

export const LOG_ID_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 2, 26, 11, 14, 6, 26, 8, 3,
]); // x-tkc-log-id

export const LANGUAGE_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 2, 26, 11, 0, 13, 6, 20, 0, 6, 4,
]); // x-tkc-language

export const SECURITY_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 2, 26, 18, 4, 2, 20, 17, 8, 19, 24,
]); // x-tkc-security

export const TIMESTAMP_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 2, 26, 19, 8, 12, 4, 18, 19, 0, 12, 15,
]); // x-tkc-timestamp

export const NONCE_HEADER_KEY = numbersToString([
  23, 26, 19, 10, 2, 26, 13, 14, 13, 2, 4,
]); // x-tkc-nonce

// console.log(
//   CLIENT_TOKEN_HEADER_KEY,
//   SYSTEM_TOKEN_HEADER_KEY,
//   LOG_ID_HEADER_KEY,
//   LANGUAGE_HEADER_KEY,
//   SECURITY_HEADER_KEY,
//   TIMESTAMP_HEADER_KEY,
//   NONCE_HEADER_KEY,
// );
