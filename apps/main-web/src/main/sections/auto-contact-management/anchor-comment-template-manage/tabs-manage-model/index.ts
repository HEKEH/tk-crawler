import type { TabModel } from './types';
import { TemplateGroupsTabModel } from './comment-template-groups-tab-model';

export default class TabsManageModel {
  private _tabs: TabModel[];

  private _activeTabId: string | undefined;

  get activeTabId() {
    return this._activeTabId;
  }

  get tabs() {
    return this._tabs;
  }

  get activeTab() {
    return this._tabs.find(t => t.id === this._activeTabId);
  }

  onSelectTab(tabId: string | undefined) {
    this._activeTabId = tabId;
    this.activeTab?.refresh?.();
  }

  addOrSelectTab(tab: TabModel) {
    if (!this._tabs.find(t => t.id === tab.id)) {
      this._tabs.push(tab);
    }
    this._activeTabId = tab.id;
  }

  batchCloseTabs(tabIds: string[]) {
    this._tabs = this._tabs.filter(t => !tabIds.includes(t.id));
    if (this._activeTabId && tabIds.includes(this._activeTabId)) {
      this.onSelectTab(this._tabs[0]?.id);
    }
  }

  closeTab(tabId: string) {
    const tabIndex = this._tabs.findIndex(t => t.id === tabId);
    if (tabIndex !== -1) {
      this._tabs.splice(tabIndex, 1);
    }
    if (this._tabs.length && this._activeTabId === tabId) {
      this.onSelectTab(this._tabs[0]?.id);
    }
  }

  constructor() {
    const groupTab = new TemplateGroupsTabModel();
    this._tabs = [groupTab];
    this._activeTabId = groupTab.id;
  }
}
