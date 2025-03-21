import process from 'node:process';

export function getAppInstallUrl(productName: string, publishUrl: string) {
  const platform = process.platform;
  const platformName = platform === 'darwin' ? 'Mac' : 'Windows';
  const ext = platform === 'darwin' ? 'dmg' : 'exe';
  return `${publishUrl}/${productName}-${platformName}-Installer.${ext}`;
}
