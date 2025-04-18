import { WithMembershipCheck } from '../../../components';
import GuildUserTable from './guild-user-table.vue';

const GuildUserManage = WithMembershipCheck(GuildUserTable);

export default GuildUserManage;
