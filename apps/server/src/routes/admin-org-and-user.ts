import Router from 'koa-router';
import OrgAndUserController from '../controllers/org-and-user';

const adminOrgAndUserRouter = new Router({ prefix: '/admin/org-and-user' });

adminOrgAndUserRouter.post('/get-org-list', OrgAndUserController.getOrgList);

adminOrgAndUserRouter.post('/delete-org', OrgAndUserController.deleteOrg);

adminOrgAndUserRouter.post('/create-org', OrgAndUserController.createOrg);

adminOrgAndUserRouter.post('/update-org', OrgAndUserController.updateOrg);

adminOrgAndUserRouter.post(
  '/update-org-membership',
  OrgAndUserController.updateOrgMembership,
);
export default adminOrgAndUserRouter;
