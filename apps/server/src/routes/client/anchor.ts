import { ClientPrivilege } from '@tk-crawler/biz-shared';
import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import AnchorController from '../../controllers/client/anchor';
import {
  checkHasMembershipAndValid,
  clientHasPrivilegeMiddleware,
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
  clientHasPrivilegeMiddleware({
    privilege: ClientPrivilege.ANCHOR_MANAGEMENT,
  }),
  AnchorController.clearAnchorCheck,
);
export default anchorRouter;
