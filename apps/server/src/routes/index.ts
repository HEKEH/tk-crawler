import Router from 'koa-router';
import anchorPoolRouter from './anchor-pool';
import orgAndUserRouter from './org-and-user';
import userRouter from './user';

const router = new Router();

router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(anchorPoolRouter.routes(), anchorPoolRouter.allowedMethods());
router.use(orgAndUserRouter.routes(), orgAndUserRouter.allowedMethods());

export default router;
