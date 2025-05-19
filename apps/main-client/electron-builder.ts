import { getElectronBuilderConfig } from '../../packages/electron-utils/electron-builder';
import {
  MAIN_APP_ID,
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PROTOCOL_NAME,
  MAIN_APP_PUBLISH_URL,
} from '../../packages/main-client-shared/src/constants/build';

const config = getElectronBuilderConfig({
  appId: MAIN_APP_ID,
  productName: MAIN_APP_PRODUCT_NAME,
  protocolName: MAIN_APP_PROTOCOL_NAME,
  publishUrl: MAIN_APP_PUBLISH_URL,
  files: ['dist-electron', 'assets'],
  extraResources: ['extra-resources'],
});

export default config;
