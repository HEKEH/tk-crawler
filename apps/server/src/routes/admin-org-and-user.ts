import { AdminPrivilege } from '@tk-crawler/biz-shared';
import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import SystemAdminOrgAndUserController from '../controllers/system-admin-org-and-user';
import {
  systemAdminHasPrivilegeMiddleware,
  systemAdminTokenAuthMiddleware,
} from '../middlewares';

const adminOrgAndUserRouter = new Router({ prefix: '/admin/org-and-user' });

adminOrgAndUserRouter.use(
  isRequestSecureMiddleware(),
  systemAdminTokenAuthMiddleware(),
);

adminOrgAndUserRouter.post(
  '/get-org-list',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.getOrgList,
);

adminOrgAndUserRouter.post(
  '/delete-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.deleteOrg,
);

adminOrgAndUserRouter.post(
  '/create-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.createOrg,
);

adminOrgAndUserRouter.post(
  '/update-org',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.updateOrg,
);

adminOrgAndUserRouter.post(
  '/update-org-membership',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.updateOrgMembership,
);

adminOrgAndUserRouter.post(
  '/update-org-auto-follow-device-limit',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.updateOrgAutoFollowDeviceLimit,
);

adminOrgAndUserRouter.post(
  '/get-org-member-list',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.getOrgMemberList,
);
adminOrgAndUserRouter.post(
  '/create-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.createOrgMember,
);

adminOrgAndUserRouter.post(
  '/update-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.updateOrgMember,
);

adminOrgAndUserRouter.post(
  '/delete-org-member',
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CLIENT_MANAGEMENT,
  }),
  SystemAdminOrgAndUserController.deleteOrgMember,
);

export default adminOrgAndUserRouter;
