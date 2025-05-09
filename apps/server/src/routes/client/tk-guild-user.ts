import Router from 'koa-router';
import TKGuildUserController from '../../controllers/client/tk-guild-user';
import {
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const tkGuildUserRouter = new Router({ prefix: '/tk-guild-user' });

tkGuildUserRouter.use(clientTokenAuthMiddleware());

// 主播相关路由
tkGuildUserRouter.post(
  '/get-user-list',
  checkIsAdminClientMiddleware,
  TKGuildUserController.getTKGuildUserList,
);

tkGuildUserRouter.post(
  '/get-user-detail',
  checkIsAdminClientMiddleware,
  TKGuildUserController.getTKGuildUserDetail,
);

tkGuildUserRouter.post(
  '/delete-user',
  checkIsAdminClientMiddleware,
  TKGuildUserController.deleteTKGuildUser,
);

// 分组相关路由
tkGuildUserRouter.post(
  '/create-user',
  checkIsAdminClientMiddleware,
  TKGuildUserController.createTKGuildUser,
);

tkGuildUserRouter.post(
  '/update-user',
  checkIsAdminClientMiddleware,
  TKGuildUserController.updateTKGuildUser,
);

// tkGuildUserRouter.post(
//   '/update-user-cookie',
//   TKGuildUserController.updateTKGuildUserCookie,
// );

tkGuildUserRouter.post(
  '/start-live-admin-account',
  checkIsAdminClientMiddleware,
  TKGuildUserController.startLiveAdminAccount,
);

tkGuildUserRouter.post(
  '/stop-live-admin-account',
  checkIsAdminClientMiddleware,
  TKGuildUserController.stopLiveAdminAccount,
);

tkGuildUserRouter.post(
  '/is-any-account-error',
  TKGuildUserController.isAnyAccountError,
);

export default tkGuildUserRouter;
