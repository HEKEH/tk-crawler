import Router from 'koa-router';
import OrgAndUserController from '../controllers/org-and-user';

const orgAndUserRouter = new Router({ prefix: '/org-and-user' });

orgAndUserRouter.post('/get-org-list', OrgAndUserController.getOrgList);

orgAndUserRouter.post('/delete-org', OrgAndUserController.deleteOrg);

orgAndUserRouter.post('/create-org', OrgAndUserController.createOrg);

orgAndUserRouter.post('/update-org', OrgAndUserController.updateOrg);

orgAndUserRouter.post(
  '/update-org-membership',
  OrgAndUserController.updateOrgMembership,
);
export default orgAndUserRouter;
