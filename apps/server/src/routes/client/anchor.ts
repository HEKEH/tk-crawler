import Router from 'koa-router';
import AnchorController from '../../controllers/client/anchor';
import { clientTokenAuthMiddleware } from '../../middlewares';

const anchorRouter = new Router({
  prefix: '/anchor',
});

anchorRouter.use(clientTokenAuthMiddleware());

anchorRouter.post('/list', AnchorController.getAnchorList);

export default anchorRouter;
