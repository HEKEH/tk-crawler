import { ClientPrivilege } from '@tk-crawler/biz-shared';
import Router from 'koa-router';
import TKGuildUserController from '../../controllers/client/tk-guild-user';
import {
  clientHasPrivilegeMiddleware,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const tkGuildUserRouter = new Router({ prefix: '/tk-guild-user' });

tkGuildUserRouter.use(clientTokenAuthMiddleware());

const hasGuildManagementPrivilegeMiddleWare = clientHasPrivilegeMiddleware({
  privilege: ClientPrivilege.GUILD_MANAGEMENT,
});

// 主播相关路由
tkGuildUserRouter.post(
  '/get-user-list',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.getTKGuildUserList,
);

tkGuildUserRouter.post(
  '/get-user-detail',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.getTKGuildUserDetail,
);

tkGuildUserRouter.post(
  '/delete-user',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.deleteTKGuildUser,
);

// 分组相关路由
tkGuildUserRouter.post(
  '/create-user',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.createTKGuildUser,
);

tkGuildUserRouter.post(
  '/update-user',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.updateTKGuildUser,
);

// tkGuildUserRouter.post(
//   '/update-user-cookie',
//   TKGuildUserController.updateTKGuildUserCookie,
// );

tkGuildUserRouter.post(
  '/start-live-admin-account',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.startLiveAdminAccount,
);

tkGuildUserRouter.post(
  '/stop-live-admin-account',
  hasGuildManagementPrivilegeMiddleWare,
  TKGuildUserController.stopLiveAdminAccount,
);

tkGuildUserRouter.post(
  '/is-any-account-error',
  TKGuildUserController.isAnyAccountError,
);

export default tkGuildUserRouter;
