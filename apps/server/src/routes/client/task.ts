import Router from 'koa-router';
import TaskController from '../../controllers/client/task';
import {
  checkHasMembershipAndValid,
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const taskRouter = new Router({
  prefix: '/task',
});

taskRouter.use(clientTokenAuthMiddleware(), checkHasMembershipAndValid);

taskRouter.post(
  '/assign',
  checkIsAdminClientMiddleware,
  TaskController.assignTask,
);
taskRouter.post('/claim', TaskController.claimTask);
taskRouter.post('/cancel-claim', TaskController.cancelClaimTask);
taskRouter.post('/anchor-contacted', TaskController.anchorContacted);
taskRouter.post('/cancel-anchor-contact', TaskController.cancelAnchorContact);

export default taskRouter;
