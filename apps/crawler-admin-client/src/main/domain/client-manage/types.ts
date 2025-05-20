export enum ClientTabType {
  OrgManage = 'OrgManage',
  OrgMembersManage = 'OrgMembersManage',
  MobileDevicesManage = 'MobileDevicesManage',
}

export interface ClientTabModel {
  readonly type: ClientTabType;
  readonly label: string;
  readonly id: string;
  readonly closable: boolean;
  refresh?: () => void;
}
