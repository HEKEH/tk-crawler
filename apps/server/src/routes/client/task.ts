import { ClientPrivilege } from '@tk-crawler/biz-shared';
import Router from 'koa-router';
import TaskController from '../../controllers/client/task';
import {
  checkHasMembershipAndValid,
  clientHasPrivilegeMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const taskRouter = new Router({
  prefix: '/task',
});

taskRouter.use(clientTokenAuthMiddleware(), checkHasMembershipAndValid);

const hasAnchorManagementPrivilegeMiddleWare = clientHasPrivilegeMiddleware({
  privilege: ClientPrivilege.ANCHOR_MANAGEMENT,
});

taskRouter.post(
  '/assign',
  hasAnchorManagementPrivilegeMiddleWare,
  TaskController.assignTask,
);
taskRouter.post(
  '/claim',
  hasAnchorManagementPrivilegeMiddleWare,
  TaskController.claimTask,
);
taskRouter.post(
  '/cancel-claim',
  hasAnchorManagementPrivilegeMiddleWare,
  TaskController.cancelClaimTask,
);
taskRouter.post(
  '/anchor-contacted',
  hasAnchorManagementPrivilegeMiddleWare,
  TaskController.anchorContacted,
);
taskRouter.post(
  '/cancel-anchor-contact',
  hasAnchorManagementPrivilegeMiddleWare,
  TaskController.cancelAnchorContact,
);

export default taskRouter;
