import { WithMembershipCheck } from '../../../components/with-membership-check';
import RawAnchorTable from './index.vue';

const AnchorTable = WithMembershipCheck(RawAnchorTable);

export default AnchorTable;
