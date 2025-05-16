import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import SystemController from '../controllers/system';
import { systemTokenAuthMiddleware } from '../middlewares';

const systemRouter = new Router({ prefix: '/system' });

systemRouter.post('/login', SystemController.login);

systemRouter.post(
  '/login-by-token',
  systemTokenAuthMiddleware(),
  SystemController.loginByToken,
);

systemRouter.post(
  '/change-password',
  systemTokenAuthMiddleware({ fetchPassword: true }),
  SystemController.changePassword,
);

systemRouter.post(
  '/crawl-statistics',
  isRequestSecureMiddleware(),
  systemTokenAuthMiddleware(),
  SystemController.getCrawlStatistics,
);

systemRouter.post(
  '/all-tk-guild-user-list',
  isRequestSecureMiddleware(),
  systemTokenAuthMiddleware(),
  SystemController.getAllTKGuildUserList,
);

systemRouter.post(
  '/start-tk-guild-user-account',
  isRequestSecureMiddleware(),
  systemTokenAuthMiddleware(),
  SystemController.startTKGuildUserAccount,
);

systemRouter.post(
  '/stop-tk-guild-user-account',
  isRequestSecureMiddleware(),
  systemTokenAuthMiddleware(),
  SystemController.stopTKGuildUserAccount,
);

systemRouter.post(
  '/is-any-guild-account-error',
  systemTokenAuthMiddleware(),
  SystemController.isAnyGuildAccountError,
);
export default systemRouter;
