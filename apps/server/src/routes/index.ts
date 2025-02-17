import Router from 'koa-router';
import anchorPoolRouter from './anchor-pool';
import userRouter from './user';

const router = new Router();

router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(anchorPoolRouter.routes(), anchorPoolRouter.allowedMethods());

export default router;
