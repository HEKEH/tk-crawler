import { randomBytes } from './random-bytes';

const MESSAGE_TOKEN_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789-_';

/** 非正式的 msToken */
export function getInformalMessageToken() {
  const randomValues = randomBytes(155);
  const result = `${Array.from(
    randomValues,
    (value: number) => MESSAGE_TOKEN_CHARS[value % MESSAGE_TOKEN_CHARS.length],
  ).join('')}=`;
  return result;
}
