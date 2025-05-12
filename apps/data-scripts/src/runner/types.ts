export interface Runner {
  run: () => Promise<{
    success: boolean;
    end: boolean;
  }>;
}
