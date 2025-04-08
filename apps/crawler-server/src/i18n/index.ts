import path from 'node:path';
import process from 'node:process';
import { ACCEPT_LANGUAGES } from '@tk-crawler/shared';
import i18n from 'i18next';
import Backend from 'i18next-fs-backend';

i18n.use(Backend).init({
  backend: {
    loadPath: path.join(process.cwd(), 'public/locales/{{lng}}.json'),
  },
  preload: ACCEPT_LANGUAGES,
});

export default i18n;
