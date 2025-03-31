import CryptoJS from 'crypto-js';

// 加密
export function simpleEncrypt(text: string, password: string) {
  return CryptoJS.AES.encrypt(text, password).toString();
}

// 解密
export function simpleDecrypt(encryptedText: string, password: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}
