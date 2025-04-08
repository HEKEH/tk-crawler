import Router from 'koa-router';
import AnchorPoolController from '../controllers/anchor-pool';

const anchorPoolRouter = new Router({ prefix: '/anchor-pool' });

anchorPoolRouter.post(
  '/should-update-anchor',
  AnchorPoolController.shouldUpdateAnchor,
);

anchorPoolRouter.post(
  '/record-anchor-crawl',
  AnchorPoolController.recordAnchorCrawl,
);

anchorPoolRouter.post(
  '/delete-anchor-crawl-record',
  AnchorPoolController.deleteAnchorCrawlRecord,
);

anchorPoolRouter.post('/update-anchor', AnchorPoolController.updateAnchor);

export default anchorPoolRouter;
