import Router from 'koa-router';
import TKGuildUserController from '../../controllers/client/tk-guild-user';
import {
  checkIsAdminClientMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const tkGuildUserRouter = new Router({ prefix: '/tk-guild-user' });

tkGuildUserRouter.use(
  clientTokenAuthMiddleware(),
  checkIsAdminClientMiddleware,
);

// 主播相关路由
tkGuildUserRouter.post(
  '/get-user-list',
  TKGuildUserController.getTKGuildUserList,
);

tkGuildUserRouter.post(
  '/get-user-detail',
  TKGuildUserController.getTKGuildUserDetail,
);

tkGuildUserRouter.post('/delete-user', TKGuildUserController.deleteTKGuildUser);

// 分组相关路由
tkGuildUserRouter.post('/create-user', TKGuildUserController.createTKGuildUser);

tkGuildUserRouter.post('/update-user', TKGuildUserController.updateTKGuildUser);

// tkGuildUserRouter.post(
//   '/update-user-cookie',
//   TKGuildUserController.updateTKGuildUserCookie,
// );

tkGuildUserRouter.post(
  '/start-live-admin-account',
  TKGuildUserController.startLiveAdminAccount,
);

tkGuildUserRouter.post(
  '/stop-live-admin-account',
  TKGuildUserController.stopLiveAdminAccount,
);

export default tkGuildUserRouter;
