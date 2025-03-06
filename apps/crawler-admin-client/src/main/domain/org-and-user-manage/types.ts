export enum OrgAndUserTabType {
  OrgManage = 'OrgManage',
  OrgMembersManage = 'OrgMembersManage',
}

export interface OrgAndUserTabModel {
  readonly type: OrgAndUserTabType;
  readonly label: string;
  readonly id: string;
  readonly closable: boolean;
  refresh?: () => void;
}
