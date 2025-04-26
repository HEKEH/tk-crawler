export interface Crawler {
  run: () => Promise<boolean>;
}
