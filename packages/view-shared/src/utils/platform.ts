type Platform = 'Mac' | 'Windows' | 'Android' | 'iOS' | 'Linux' | 'unknown';
type MobileDeviceType = 'Android' | 'iOS' | undefined;

export function getMobileDeviceType(): MobileDeviceType {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/android/.test(userAgent)) {
    return 'Android';
  }

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'iOS';
  }

  return undefined;
}

export function getPlatform(): Platform {
  //   if ((navigator as any).userAgentData?.platform) {
  //     return (navigator as any).userAgentData.platform;
  //   }
  const userAgent = navigator.userAgent;
  if (
    userAgent.includes('Mac') &&
    !userAgent.includes('iPhone') &&
    !userAgent.includes('iPad')
  ) {
    return 'Mac';
  }
  if (userAgent.includes('Windows')) {
    return 'Windows';
  }
  const mobileDeviceType = getMobileDeviceType();
  if (mobileDeviceType) {
    return mobileDeviceType;
  }
  if (userAgent.includes('Linux')) {
    return 'Linux';
  }
  throw new Error('Unknown platform');
}

export function isDesktopPlatform(): boolean {
  const platform = getPlatform();
  return platform === 'Mac' || platform === 'Windows';
}

export function isMobilePlatform(): boolean {
  const platform = getPlatform();
  return platform === 'Android' || platform === 'iOS';
}
