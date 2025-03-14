import Router from 'koa-router';
import adminOrgAndUserRouter from './admin-org-and-user';
import anchorPoolRouter from './anchor-pool';
import followHelpRouter from './auth';
import userRouter from './user';

const router = new Router();

router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(anchorPoolRouter.routes(), anchorPoolRouter.allowedMethods());
router.use(
  adminOrgAndUserRouter.routes(),
  adminOrgAndUserRouter.allowedMethods(),
);
router.use(followHelpRouter.routes(), followHelpRouter.allowedMethods());

export default router;
