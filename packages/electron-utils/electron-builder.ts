/* eslint-disable no-template-curly-in-string */
import type { Configuration } from 'electron-builder';

/**
 * @see https://www.electron.build/configuration
 */
export function getElectronBuilderConfig(props: {
  appId: string;
  productName: string;
  protocolName: string;
  publishUrl: string;
  files?: string[];
}) {
  const {
    appId,
    productName,
    protocolName,
    publishUrl,
    files = ['dist', 'dist-electron'],
  } = props;
  const config: Configuration = {
    appId,
    asar: true,
    productName,
    directories: {
      output: 'release/${version}',
    },
    files,
    protocols: {
      name: protocolName,
      schemes: [appId],
    },
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
      extendInfo: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [appId],
            CFBundleURLName: protocolName,
          },
        ],
      },
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64'],
        },
      ],
      protocols: [
        {
          name: protocolName,
          schemes: [appId],
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
