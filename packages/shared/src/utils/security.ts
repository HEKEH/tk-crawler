import _xss from 'xss';

export function xss<T extends string | null | undefined>(input: T): T {
  if (typeof input !== 'string') {
    return input;
  }
  return _xss(input) as T;
}
