import { AdminPrivilege } from '@tk-crawler/biz-shared';
import { isRequestSecureMiddleware } from '@tk-crawler/server-shared';
import Router from 'koa-router';
import SystemController from '../controllers/system';
import {
  systemAdminHasPrivilegeMiddleware,
  systemAdminTokenAuthMiddleware,
} from '../middlewares';

const systemRouter = new Router({ prefix: '/system' });

systemRouter.post('/login', SystemController.login);

systemRouter.post(
  '/login-by-token',
  systemAdminTokenAuthMiddleware(),
  SystemController.loginByToken,
);

systemRouter.post(
  '/change-password',
  systemAdminTokenAuthMiddleware({ fetchPassword: true }),
  SystemController.changePassword,
);

systemRouter.post(
  '/crawl-statistics',
  isRequestSecureMiddleware(),
  systemAdminTokenAuthMiddleware(),
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.CRAWLER_MANAGEMENT,
  }),
  SystemController.getCrawlStatistics,
);

systemRouter.post(
  '/all-tk-guild-user-list',
  isRequestSecureMiddleware(),
  systemAdminTokenAuthMiddleware(),
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.GUILD_MANAGEMENT,
  }),
  SystemController.getAllTKGuildUserList,
);

systemRouter.post(
  '/start-tk-guild-user-account',
  isRequestSecureMiddleware(),
  systemAdminTokenAuthMiddleware(),
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.GUILD_MANAGEMENT,
  }),
  SystemController.startTKGuildUserAccount,
);

systemRouter.post(
  '/stop-tk-guild-user-account',
  isRequestSecureMiddleware(),
  systemAdminTokenAuthMiddleware(),
  systemAdminHasPrivilegeMiddleware({
    privilege: AdminPrivilege.GUILD_MANAGEMENT,
  }),
  SystemController.stopTKGuildUserAccount,
);

systemRouter.post(
  '/is-any-guild-account-error',
  systemAdminTokenAuthMiddleware(),
  SystemController.isAnyGuildAccountError,
);
export default systemRouter;
