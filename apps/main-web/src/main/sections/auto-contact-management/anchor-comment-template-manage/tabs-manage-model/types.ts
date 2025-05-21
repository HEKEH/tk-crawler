export enum TabType {
  TemplateGroupList = 'TemplateGroupList',
  Templates = 'Templates',
}

export interface TabModel {
  readonly type: TabType;
  readonly label: string;
  readonly id: string;
  readonly closable: boolean;
  refresh?: () => void;
}
