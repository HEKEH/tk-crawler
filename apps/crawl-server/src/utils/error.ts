export class BusinessError extends Error {
  readonly isBusinessError = true;
}

export class TokenInvalidError extends Error {
  readonly isTokenInvalidError = true;
}
