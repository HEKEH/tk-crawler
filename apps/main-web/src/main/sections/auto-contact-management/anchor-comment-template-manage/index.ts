import { WithMembershipCheck } from '../../../components';
import RawAnchorCommentTemplateManage from './index.vue';

const AnchorCommentTemplateManage = WithMembershipCheck(
  RawAnchorCommentTemplateManage,
);

export default AnchorCommentTemplateManage;
