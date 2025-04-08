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

// 评论模板相关路由
followHelpRouter.post(
  '/get-comment-template-list',
  FollowHelpController.getAnchorCommentTemplateList,
);

followHelpRouter.post(
  '/create-comment-template',
  FollowHelpController.createAnchorCommentTemplate,
);

followHelpRouter.post(
  '/update-comment-template',
  FollowHelpController.updateAnchorCommentTemplate,
);

followHelpRouter.post(
  '/delete-comment-template',
  FollowHelpController.deleteAnchorCommentTemplate,
);

followHelpRouter.post(
  '/clear-comment-template',
  FollowHelpController.clearAnchorCommentTemplate,
);

// 评论模板分组相关路由
followHelpRouter.post(
  '/get-comment-template-group-list',
  FollowHelpController.getAnchorCommentTemplateGroupList,
);

followHelpRouter.post(
  '/get-comment-template-group',
  FollowHelpController.getAnchorCommentTemplateGroupById,
);

followHelpRouter.post(
  '/create-comment-template-group',
  FollowHelpController.createAnchorCommentTemplateGroup,
);

followHelpRouter.post(
  '/update-comment-template-group',
  FollowHelpController.updateAnchorCommentTemplateGroup,
);

followHelpRouter.post(
  '/delete-comment-template-group',
  FollowHelpController.deleteAnchorCommentTemplateGroup,
);

followHelpRouter.post(
  '/clear-comment-template-group',
  FollowHelpController.clearAnchorCommentTemplateGroup,
);

export default followHelpRouter;
