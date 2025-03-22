import Router from 'koa-router';
import MemberController from '../controllers/client/member';
import {
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../middlewares';

const clientRouter = new Router({ prefix: '/client' });

clientRouter.post(
  '/get-org-member-list',
  clientTokenAuthMiddleware,
  MemberController.getOrgMemberList,
);
clientRouter.post(
  '/create-org-member',
  clientTokenAuthMiddleware,
  checkIsAdminClientMiddleware,
  MemberController.createOrgMember,
);
clientRouter.post(
  '/update-org-member',
  clientTokenAuthMiddleware,
  checkIsAdminClientMiddleware,
  MemberController.updateOrgMember,
);
clientRouter.post(
  '/delete-org-member',
  clientTokenAuthMiddleware,
  checkIsAdminClientMiddleware,
  MemberController.deleteOrgMember,
);
export default clientRouter;
