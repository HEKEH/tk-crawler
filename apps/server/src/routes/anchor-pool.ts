import Router from 'koa-router';
import AnchorPoolController from '../controllers/anchor-pool';

const anchorPoolRouter = new Router({ prefix: '/anchor-pool' });

anchorPoolRouter.get(
  '/should-update-anchor',
  AnchorPoolController.shouldUpdateAnchor,
);

anchorPoolRouter.post('/update-anchor', AnchorPoolController.updateAnchor);

export default anchorPoolRouter;
