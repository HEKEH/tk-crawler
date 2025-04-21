import Router from 'koa-router';
import adminOrgAndUserRouter from './admin-org-and-user';
import anchorPoolRouter from './anchor-pool';
import authRouter from './auth';
import clientRouter from './client';
import followHelpRouter from './follow-help';
import systemRouter from './system';

const router = new Router();

router.use(anchorPoolRouter.routes(), anchorPoolRouter.allowedMethods());
router.use(
  adminOrgAndUserRouter.routes(),
  adminOrgAndUserRouter.allowedMethods(),
);

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(followHelpRouter.routes(), followHelpRouter.allowedMethods());
router.use(clientRouter.routes(), clientRouter.allowedMethods());
router.use(systemRouter.routes(), systemRouter.allowedMethods());
export default router;
