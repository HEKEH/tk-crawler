export function getPlatform() {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Mac')) {
    return 'Mac';
  }
  if (userAgent.includes('Windows')) {
    return 'Windows';
  }
  if (userAgent.includes('Linux')) {
    return 'Linux';
  }

  return 'Unknown';
}
