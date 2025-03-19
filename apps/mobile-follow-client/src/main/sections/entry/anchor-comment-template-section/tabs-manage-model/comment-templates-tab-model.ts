import type { AnchorCommentTemplateGroup } from '@tk-crawler/biz-shared';
import type { TabModel } from './types';
import { TabType } from './types';

export function generateTemplateTabId(templateGroupId: string) {
  return `templates-manage-${templateGroupId}`;
}

export class TemplatesTabModel implements TabModel {
  readonly type = TabType.Templates;
  readonly closable = true;
  private _templateGroup: AnchorCommentTemplateGroup;
  get templateGroup() {
    return this._templateGroup;
  }

  get id() {
    return generateTemplateTabId(this._templateGroup.id);
  }

  get label() {
    return `模板组管理-${this._templateGroup.name}`;
  }

  constructor(props: { templateGroup: AnchorCommentTemplateGroup }) {
    this._templateGroup = props.templateGroup;
  }
}
