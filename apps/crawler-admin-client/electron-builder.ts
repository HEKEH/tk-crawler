import { getElectronBuilderConfig } from '../../packages/electron-utils/electron-builder';
import {
  APP_ID,
  APP_PROTOCOL_NAME,
  PRODUCT_NAME,
  PUBLISH_URL,
} from './shared/constants';

const config = getElectronBuilderConfig({
  appId: APP_ID,
  productName: PRODUCT_NAME,
  protocolName: APP_PROTOCOL_NAME,
  publishUrl: PUBLISH_URL,
  files: ['dist-electron', 'assets'],
  extraResources: ['extra-resources'],
});

export default config;
