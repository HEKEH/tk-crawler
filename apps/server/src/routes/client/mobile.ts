import Router from 'koa-router';
import MobileController from '../../controllers/client/mobile';
import {
  checkHasMembershipAndValid,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const mobileRouter = new Router({
  prefix: '/mobile',
});

mobileRouter.post('/login', MobileController.mobileOrgMemberLogin);
mobileRouter.post(
  '/login-by-token',
  clientTokenAuthMiddleware(),
  checkHasMembershipAndValid,
  MobileController.mobileOrgMemberLoginByToken,
);
mobileRouter.post(
  '/get-assigned-anchor-list',
  clientTokenAuthMiddleware(),
  checkHasMembershipAndValid,
  MobileController.getAssignedAnchorList,
);
mobileRouter.post(
  '/anchor-contacted',
  clientTokenAuthMiddleware(),
  checkHasMembershipAndValid,
  MobileController.anchorContacted,
);

export default mobileRouter;
