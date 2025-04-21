import Router from 'koa-router';
import OrgAndUserController from '../controllers/org-and-user';
import { systemTokenAuthMiddleware } from '../middlewares';

const adminOrgAndUserRouter = new Router({ prefix: '/admin/org-and-user' });

adminOrgAndUserRouter.use(systemTokenAuthMiddleware());

adminOrgAndUserRouter.post('/get-org-list', OrgAndUserController.getOrgList);

adminOrgAndUserRouter.post('/delete-org', OrgAndUserController.deleteOrg);

adminOrgAndUserRouter.post('/create-org', OrgAndUserController.createOrg);

adminOrgAndUserRouter.post('/update-org', OrgAndUserController.updateOrg);

adminOrgAndUserRouter.post(
  '/update-org-membership',
  OrgAndUserController.updateOrgMembership,
);

adminOrgAndUserRouter.post(
  '/get-org-member-list',
  OrgAndUserController.getOrgMemberList,
);
adminOrgAndUserRouter.post(
  '/create-org-member',
  OrgAndUserController.createOrgMember,
);

adminOrgAndUserRouter.post(
  '/update-org-member',
  OrgAndUserController.updateOrgMember,
);

adminOrgAndUserRouter.post(
  '/delete-org-member',
  OrgAndUserController.deleteOrgMember,
);

export default adminOrgAndUserRouter;
