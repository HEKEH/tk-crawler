import Router from 'koa-router';
import AuthController from '../controllers/auth';
import { clientTokenAuthMiddleware } from '../middlewares';

const authRouter = new Router({ prefix: '/auth' });

authRouter.post('/org-member-login', AuthController.orgMemberLogin);
authRouter.post(
  '/org-member-login-by-token',
  clientTokenAuthMiddleware(),
  AuthController.orgMemberLoginByToken,
);

authRouter.post(
  '/change-password',
  clientTokenAuthMiddleware({ fetchPassword: true }),
  AuthController.changePassword,
);

export default authRouter;
