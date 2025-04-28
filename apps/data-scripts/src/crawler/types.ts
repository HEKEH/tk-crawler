export interface Crawler {
  run: () => Promise<{
    success: boolean;
    end: boolean;
  }>;
}
