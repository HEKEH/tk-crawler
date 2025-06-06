import { ClientPrivilege } from '@tk-crawler/biz-shared';
import Router from 'koa-router';
import ClientOrgAndUserController from '../../controllers/client/org-and-user';
import {
  clientHasPrivilegeMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const orgAndUserRouter = new Router({
  prefix: '/org-and-user',
});

orgAndUserRouter.use(clientTokenAuthMiddleware());

const hasSystemManagementPrivilegeMiddleWare = clientHasPrivilegeMiddleware({
  privilege: ClientPrivilege.SYSTEM_MANAGEMENT,
});

// org and user
orgAndUserRouter.post(
  '/get-org-member-list',
  ClientOrgAndUserController.getOrgMemberList,
);
orgAndUserRouter.post(
  '/create-org-member',
  hasSystemManagementPrivilegeMiddleWare,
  ClientOrgAndUserController.createOrgMember,
);
orgAndUserRouter.post(
  '/update-org-member',
  hasSystemManagementPrivilegeMiddleWare,
  ClientOrgAndUserController.updateOrgMember,
);
orgAndUserRouter.post(
  '/delete-org-member',
  hasSystemManagementPrivilegeMiddleWare,
  ClientOrgAndUserController.deleteOrgMember,
);

orgAndUserRouter.post(
  '/update-org-anchor-search-policies',
  hasSystemManagementPrivilegeMiddleWare,
  ClientOrgAndUserController.updateOrgAnchorSearchPolicies,
);

export default orgAndUserRouter;
