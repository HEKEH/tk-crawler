export class RequestError extends Error {
  readonly rawError: Error;
  constructor(rawError: Error) {
    super(rawError.message);
    this.rawError = rawError;
  }

  toString(): string {
    return this.rawError.toString();
  }
}
