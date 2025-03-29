import Router from 'koa-router';
import MemberController from '../../controllers/client/member';
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
  MemberController.getOrgMemberList,
);
orgAndUserRouter.post(
  '/create-org-member',
  checkIsAdminClientMiddleware,
  MemberController.createOrgMember,
);
orgAndUserRouter.post(
  '/update-org-member',
  checkIsAdminClientMiddleware,
  MemberController.updateOrgMember,
);
orgAndUserRouter.post(
  '/delete-org-member',
  checkIsAdminClientMiddleware,
  MemberController.deleteOrgMember,
);

export default orgAndUserRouter;
