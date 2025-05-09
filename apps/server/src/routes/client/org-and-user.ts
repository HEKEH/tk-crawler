import Router from 'koa-router';
import ClientOrgAndUserController from '../../controllers/client/org-and-user';
import {
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const orgAndUserRouter = new Router({
  prefix: '/org-and-user',
});

orgAndUserRouter.use(clientTokenAuthMiddleware());

// org and user
orgAndUserRouter.post(
  '/get-org-member-list',
  ClientOrgAndUserController.getOrgMemberList,
);
orgAndUserRouter.post(
  '/create-org-member',
  checkIsAdminClientMiddleware,
  ClientOrgAndUserController.createOrgMember,
);
orgAndUserRouter.post(
  '/update-org-member',
  checkIsAdminClientMiddleware,
  ClientOrgAndUserController.updateOrgMember,
);
orgAndUserRouter.post(
  '/delete-org-member',
  checkIsAdminClientMiddleware,
  ClientOrgAndUserController.deleteOrgMember,
);

orgAndUserRouter.post(
  '/update-org-anchor-search-policies',
  checkIsAdminClientMiddleware,
  ClientOrgAndUserController.updateOrgAnchorSearchPolicies,
);

export default orgAndUserRouter;
