import Router from 'koa-router';
import MobileController from '../../controllers/client/mobile';
import {
  checkHasMembershipAndValid,
  checkIsMobileDeviceValid,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const mobileRouter = new Router({
  prefix: '/mobile',
});

mobileRouter.post('/login', MobileController.mobileOrgMemberLogin);
const clientTokenAuthMiddlewareItem = clientTokenAuthMiddleware({
  fetchMobileDevices: true,
});
mobileRouter.post(
  '/login-by-token',
  clientTokenAuthMiddlewareItem,
  checkHasMembershipAndValid,
  checkIsMobileDeviceValid,
  MobileController.mobileOrgMemberLoginByToken,
);
mobileRouter.post(
  '/get-assigned-anchor-list',
  clientTokenAuthMiddlewareItem,
  checkHasMembershipAndValid,
  checkIsMobileDeviceValid,
  MobileController.getAssignedAnchorList,
);
mobileRouter.post(
  '/anchor-contacted',
  clientTokenAuthMiddlewareItem,
  checkHasMembershipAndValid,
  checkIsMobileDeviceValid,
  MobileController.anchorContacted,
);

export default mobileRouter;
