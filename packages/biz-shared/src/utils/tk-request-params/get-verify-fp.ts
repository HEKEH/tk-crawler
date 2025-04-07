import { randomBytes } from './random-bytes';

const VERIFY_FP_CHARS =
  'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789_';
export function getVerifyFp() {
  const randomValues = randomBytes(45);
  const result = Array.from(
    randomValues,
    (value: number) => VERIFY_FP_CHARS[value % VERIFY_FP_CHARS.length],
  ).join('');
  return `verify_${result}`;
}
