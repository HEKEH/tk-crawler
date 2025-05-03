import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import AuthController from '../controllers/auth';
import { clientTokenAuthMiddleware } from '../middlewares';

const authRouter = new Router({ prefix: '/auth' });

authRouter.post(
  '/org-member-login',
  isRequestSecureMiddleware(),
  AuthController.orgMemberLogin,
);
authRouter.post(
  '/org-member-login-by-token',
  clientTokenAuthMiddleware(),
  isRequestSecureMiddleware(),
  AuthController.orgMemberLoginByToken,
);

authRouter.post(
  '/change-password',
  clientTokenAuthMiddleware({ fetchPassword: true }),
  isRequestSecureMiddleware(),
  AuthController.changePassword,
);

export default authRouter;
