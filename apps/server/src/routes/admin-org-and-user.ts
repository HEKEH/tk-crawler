import { AdminPrivilege } from '@tk-crawler/biz-shared';
import Router from 'koa-router';
import OrgAndUserController from '../controllers/org-and-user';
import {
  systemAdminHasPrivilegeMiddleware,
  systemAdminTokenAuthMiddleware,
} from '../middlewares';

const adminOrgAndUserRouter = new Router({ prefix: '/admin/org-and-user' });

adminOrgAndUserRouter.use(systemAdminTokenAuthMiddleware());

adminOrgAndUserRouter.post(
  '/get-org-list',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.getOrgList,
);

adminOrgAndUserRouter.post(
  '/delete-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.deleteOrg,
);

adminOrgAndUserRouter.post(
  '/create-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.createOrg,
);

adminOrgAndUserRouter.post(
  '/update-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.updateOrg,
);

adminOrgAndUserRouter.post(
  '/update-org-membership',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.updateOrgMembership,
);

adminOrgAndUserRouter.post(
  '/get-org-member-list',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.getOrgMemberList,
);
adminOrgAndUserRouter.post(
  '/create-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.createOrgMember,
);

adminOrgAndUserRouter.post(
  '/update-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.updateOrgMember,
);

adminOrgAndUserRouter.post(
  '/delete-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  OrgAndUserController.deleteOrgMember,
);

export default adminOrgAndUserRouter;
