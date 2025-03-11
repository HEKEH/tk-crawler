import Router from 'koa-router';
import AuthController from '../controllers/auth';

const authRouter = new Router({ prefix: '/auth' });

authRouter.post('/org-member-login', AuthController.orgMemberLogin);
authRouter.post(
  '/org-member-login-by-token',
  AuthController.orgMemberLoginByToken,
);
export default authRouter;
