import { WithMembershipCheck } from '../../../components/with-membership-check';
import GuildUserTable from './guild-user-table.vue';

const GuildUserManage = WithMembershipCheck(GuildUserTable);

export default GuildUserManage;
