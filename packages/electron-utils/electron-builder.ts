/* eslint-disable no-template-curly-in-string */
import type { Configuration } from 'electron-builder';

/**
 * @see https://www.electron.build/configuration
 */
export function getElectronBuilderConfig(props: {
  appId: string;
  productName: string;
  publishUrl: string;
}) {
  const { appId, productName, publishUrl } = props;
  const config: Configuration = {
    appId,
    asar: true,
    productName,
    directories: {
      output: 'release/${version}',
    },
    files: ['dist', 'dist-electron'],
    publish: [
      {
        provider: 'generic',
        url: publishUrl,
      },
    ],
    mac: {
      target: ['dmg', 'zip'],
      icon: 'build/icons/icon.icns',
      artifactName: '${productName}-Mac-Installer.${ext}',
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64'],
        },
      ],
      icon: 'build/icons/icon.ico',
      artifactName: '${productName}-Windows-Installer.${ext}',
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      deleteAppDataOnUninstall: false,
    },
    linux: {
      target: ['AppImage'],
      icon: 'build/icons/icon.png',
      artifactName: '${productName}-Linux-Installer.${ext}',
    },
  };
  return config;
}
