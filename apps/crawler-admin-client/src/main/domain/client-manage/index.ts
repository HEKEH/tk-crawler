import type { OrganizationItem } from '@tk-crawler/biz-shared';
import type { ClientTabModel } from './types';
import OrgMembersManageTabModel, {
  generateOrgMembersManageTabId,
} from './members-manage-tab-model';
import OrgManageTabModel from './org-manage-tab-model';

export default class ClientManage {
  private _tabs: ClientTabModel[];

  private _activeTabId: string;

  get activeTabId() {
    return this._activeTabId;
  }

  get tabs() {
    return this._tabs;
  }

  get activeTab() {
    return this._tabs.find(t => t.id === this._activeTabId)!;
  }

  onSelectTab(tabId: string) {
    this._activeTabId = tabId;
    this.activeTab.refresh?.();
  }

  onOrgMembersManage(org: OrganizationItem) {
    const id = generateOrgMembersManageTabId(org.id);
    if (!this._tabs.find(t => t.id === id)) {
      this._tabs.push(new OrgMembersManageTabModel({ org }));
    }
    this._activeTabId = id;
  }

  closeTab(tabId: string) {
    const tabIndex = this._tabs.findIndex(t => t.id === tabId);
    if (tabIndex !== -1) {
      this._tabs.splice(tabIndex, 1);
    }
    if (this._activeTabId === tabId) {
      this.onSelectTab(this._tabs[0].id);
    }
  }

  constructor() {
    const orgManageTab = new OrgManageTabModel({
      context: this,
    });
    this._tabs = [orgManageTab];
    this._activeTabId = orgManageTab.id;
  }
}
