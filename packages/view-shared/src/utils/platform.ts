type Platform = 'Mac' | 'Windows' | 'Android' | 'iOS' | 'Linux' | 'unknown';
type MobileDeviceType = 'Android' | 'iOS' | undefined;

export function getMobileDeviceType(): MobileDeviceType {
  console.log('进入getMobileDeviceType');
  const userAgent = navigator.userAgent.toLowerCase();

  if (/android/.test(userAgent)) {
    return 'Android';
  }

  if (/iphone|ipad|ipod|safari/.test(userAgent)) {
    return 'iOS';
  }

  return undefined;
}

export function getPlatform(): Platform {
  //   if ((navigator as any).userAgentData?.platform) {
  //     return (navigator as any).userAgentData.platform;
  //   }
  console.log('进入getPlatform');
  console.log('navigator', navigator);
  const userAgent = navigator.userAgent;
  console.log('userAgent', userAgent);
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
  console.log('Unknown platform');
  throw new Error('Unknown platform');
}

export function isDesktopPlatform(): boolean {
  const platform = getPlatform();
  return platform === 'Mac' || platform === 'Windows';
}

export function isMobilePlatform(): boolean {
  console.log('进入isMobilePlatform');
  const platform = getPlatform();
  return platform === 'Android' || platform === 'iOS';
}
