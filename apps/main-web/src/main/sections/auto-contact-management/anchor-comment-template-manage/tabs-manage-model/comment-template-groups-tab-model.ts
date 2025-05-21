import type { TabModel } from './types';
import { TabType } from './types';

export class TemplateGroupsTabModel implements TabModel {
  readonly type = TabType.TemplateGroupList;
  readonly closable = false;

  refresh?: () => void;

  get id() {
    return `template-group-list-manage`;
  }

  get label() {
    return '评论模板组列表';
  }

  constructor() {}
}
