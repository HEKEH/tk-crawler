import Router from 'koa-router';
import AutoContactController from '../../controllers/client/auto-contact';
import {
  checkHasMembershipAndValid,
  clientTokenAuthMiddleware,
} from '../../middlewares';

const autoContactRouter = new Router({
  prefix: '/auto-contact',
});

autoContactRouter.use(clientTokenAuthMiddleware(), checkHasMembershipAndValid);

// 评论模板相关路由
autoContactRouter.post(
  '/get-comment-template-list',
  AutoContactController.getAnchorCommentTemplateList,
);

autoContactRouter.post(
  '/create-comment-template',
  AutoContactController.createAnchorCommentTemplate,
);

autoContactRouter.post(
  '/update-comment-template',
  AutoContactController.updateAnchorCommentTemplate,
);

autoContactRouter.post(
  '/delete-comment-template',
  AutoContactController.deleteAnchorCommentTemplate,
);

autoContactRouter.post(
  '/clear-comment-template',
  AutoContactController.clearAnchorCommentTemplate,
);

// 评论模板分组相关路由
autoContactRouter.post(
  '/get-comment-template-group-list',
  AutoContactController.getAnchorCommentTemplateGroupList,
);

autoContactRouter.post(
  '/get-comment-template-group',
  AutoContactController.getAnchorCommentTemplateGroupById,
);

autoContactRouter.post(
  '/create-comment-template-group',
  AutoContactController.createAnchorCommentTemplateGroup,
);

autoContactRouter.post(
  '/update-comment-template-group',
  AutoContactController.updateAnchorCommentTemplateGroup,
);

autoContactRouter.post(
  '/delete-comment-template-group',
  AutoContactController.deleteAnchorCommentTemplateGroup,
);

autoContactRouter.post(
  '/clear-comment-template-group',
  AutoContactController.clearAnchorCommentTemplateGroup,
);

export default autoContactRouter;
