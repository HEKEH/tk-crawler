import { getElectronBuilderConfig } from '../../packages/electron-utils/electron-builder';
import { APP_ID, PRODUCT_NAME, PUBLISH_URL } from './shared/constants';

const config = getElectronBuilderConfig({
  appId: APP_ID,
  productName: PRODUCT_NAME,
  publishUrl: PUBLISH_URL,
});

export default config;
