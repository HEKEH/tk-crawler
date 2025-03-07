export enum ClientTabType {
  OrgManage = 'OrgManage',
  OrgMembersManage = 'OrgMembersManage',
}

export interface ClientTabModel {
  readonly type: ClientTabType;
  readonly label: string;
  readonly id: string;
  readonly closable: boolean;
  refresh?: () => void;
}
