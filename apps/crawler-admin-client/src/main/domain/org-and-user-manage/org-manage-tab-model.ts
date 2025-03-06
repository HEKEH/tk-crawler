import type { OrganizationItem } from '@tk-crawler/biz-shared';
import type { OrgAndUserTabModel } from './types';
import { OrgAndUserTabType } from './types';

interface OrgManageTabModelContext {
  onOrgMembersManage: (org: OrganizationItem) => void;
}

export default class OrgManageTabModel implements OrgAndUserTabModel {
  private _context: OrgManageTabModelContext;
  readonly type = OrgAndUserTabType.OrgManage;
  readonly closable = false;

  refresh?: () => void;

  onOrgMembersManage(org: OrganizationItem) {
    this._context.onOrgMembersManage(org);
  }

  get id() {
    return `org-manage`;
  }

  get label() {
    return '机构管理';
  }

  constructor({ context }: { context: OrgManageTabModelContext }) {
    this._context = context;
  }
}
