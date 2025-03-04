import { MessageCenter } from '@tk-crawler/shared';
import { markRaw } from 'vue';
import { Menu } from '../types';
import CrawlerManage from './crawler-manage';
import OrgAndUserManage from './org-and-user-manage';

export default class GlobalStore {
  private _crawlerManage: CrawlerManage;

  private _orgAndUserManage: OrgAndUserManage;
  private _currentMenu: Menu = Menu.Crawler;

  readonly messageCenter = markRaw(new MessageCenter());

  get crawlerManage() {
    return this._crawlerManage;
  }

  get orgAndUserManage() {
    return this._orgAndUserManage;
  }

  get currentMenu() {
    return this._currentMenu;
  }

  constructor() {
    this._crawlerManage = new CrawlerManage();
    this._orgAndUserManage = new OrgAndUserManage();
  }

  async init() {
    await this.crawlerManage.init();
  }

  setCurrentMenu(menu: Menu) {
    this._currentMenu = menu;
  }

  async destroy() {
    this.messageCenter.clear();
    await this.crawlerManage.destroy();
  }
}
