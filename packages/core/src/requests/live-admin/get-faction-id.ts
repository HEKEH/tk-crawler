import { startup } from './startup';

export async function getFactionId(cookie: string): Promise<string | null> {
  const startupResponse = await startup(cookie);
  if (startupResponse?.user?.unionID) {
    return startupResponse.user.unionID;
  }
  return null;
}
