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

systemRouter.get(
  '/crawl-statistics',
  systemTokenAuthMiddleware(),
  SystemController.getCrawlStatistics,
);

export default systemRouter;
