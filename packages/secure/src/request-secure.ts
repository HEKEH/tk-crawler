import CryptoJS from 'crypto-js';

export interface RequestHashData {
  path: string;
  params?: Record<string, any>;
  method: 'get' | 'post';
  timestamp: number;
  nonce: string;
}

export interface HashOptions {
  secretKey?: string;
  encoding?: 'hex' | 'base64';
}

/**
 * Sorts object keys recursively to ensure consistent hashing
 */
function sortObjectKeys(obj: Record<string, any>): Record<string, any> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key: string) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
}

function getSecretKey(options?: HashOptions): string {
  if (options?.secretKey) {
    return options.secretKey;
  }
  const allLetters = 'abcdefghijklmnopqrstuvwxyz';
  const allNumbers = '0123456789';
  const allSymbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = allLetters + allNumbers + allSymbols;
  const indexes = [3, 3, 5, 7, 35, 42, 45, 9, 8, 5];
  const secretKey = indexes.map(index => allChars[index]).join('');
  return secretKey;
}

/**
 * Generates a hash for the request data
 */
export async function hashRequest(
  data: RequestHashData,
  options?: HashOptions,
): Promise<string> {
  try {
    // Validate input
    if (!data.path) {
      throw new Error('Path is required');
    }
    const secretKey = getSecretKey(options);

    // Set default values
    const timestamp = data.timestamp || Date.now();
    const nonce = data.nonce || CryptoJS.lib.WordArray.random(16).toString();
    const encoding = options?.encoding || 'hex';

    // Create message to hash
    const message = {
      path: data.path,
      timestamp,
      nonce,
      params: sortObjectKeys(data.params || {}),
    };

    // Convert message to string
    const messageString = JSON.stringify(message);

    // Create HMAC
    const hmac = CryptoJS.HmacSHA256(messageString, secretKey);

    // Return hash in specified encoding
    return encoding === 'base64'
      ? hmac.toString(CryptoJS.enc.Base64)
      : hmac.toString(CryptoJS.enc.Hex);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to hash request: ${errorMessage}`);
  }
}

/**
 * Verifies if the provided hash matches the request data
 */
export async function verifyRequest(
  data: Required<RequestHashData>,
  hash: string,
  options?: HashOptions,
): Promise<boolean> {
  try {
    // Validate input
    if (!hash) {
      throw new Error('Hash is required');
    }

    // Generate hash for comparison
    const generatedHash = await hashRequest(data, options);

    // Compare hashes
    return hash === generatedHash;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to verify request: ${errorMessage}`);
  }
}

/**
 * Utility function to generate a nonce
 */
export function generateNonce(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Utility function to check if a timestamp is valid
 */
export function isTimestampValid(
  timestamp: number,
  maxAgeMs: number = 5 * 60 * 1000,
): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= maxAgeMs;
}
