import Router from 'koa-router';
import FollowHelpController from '../controllers/follow-help';

const followHelpRouter = new Router({ prefix: '/follow-help' });

// 主播相关路由
followHelpRouter.post(
  '/get-anchor-list',
  FollowHelpController.getAnchorFrom87List,
);

followHelpRouter.post(
  '/create-or-update-anchor',
  FollowHelpController.createOrUpdateAnchorFrom87,
);

followHelpRouter.post(
  '/delete-anchor',
  FollowHelpController.deleteAnchorFrom87,
);

followHelpRouter.post('/clear-anchor', FollowHelpController.clearAnchorFrom87);

// 分组相关路由
followHelpRouter.post(
  '/get-group-list',
  FollowHelpController.getAnchorFollowGroupList,
);

followHelpRouter.post('/get-group', FollowHelpController.getAnchorFollowGroup);

followHelpRouter.post(
  '/get-group-with-anchor-ids',
  FollowHelpController.getAnchorFollowGroupWithAnchorIds,
);

followHelpRouter.post(
  '/create-group',
  FollowHelpController.createAnchorFollowGroup,
);

followHelpRouter.post(
  '/update-group',
  FollowHelpController.updateAnchorFollowGroup,
);

followHelpRouter.post(
  '/delete-group',
  FollowHelpController.deleteAnchorFollowGroup,
);

followHelpRouter.post(
  '/clear-group',
  FollowHelpController.clearAnchorFollowGroup,
);

export default followHelpRouter;
