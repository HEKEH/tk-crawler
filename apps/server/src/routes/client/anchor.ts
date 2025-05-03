import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import AnchorController from '../../controllers/client/anchor';
import {
  checkHasMembershipAndValid,
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const anchorRouter = new Router({
  prefix: '/anchor',
});

anchorRouter.use(clientTokenAuthMiddleware(), checkHasMembershipAndValid);

anchorRouter.post(
  '/list',
  isRequestSecureMiddleware(),
  AnchorController.getAnchorList,
);
anchorRouter.post(
  '/list-for-download',
  isRequestSecureMiddleware(),
  AnchorController.getAnchorListForDownload,
);
anchorRouter.post(
  '/clear-check',
  checkIsAdminClientMiddleware,
  AnchorController.clearAnchorCheck,
);
export default anchorRouter;
