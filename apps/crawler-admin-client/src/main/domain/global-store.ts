import { MessageCenter } from '@tk-crawler/shared';
import { markRaw } from 'vue';
import { Menu } from '../types';
import ClientManage from './client-manage';
import CrawlerManage from './crawler-manage';

export default class GlobalStore {
  private _crawlerManage: CrawlerManage;

  private _clientManage: ClientManage;
  private _currentMenu: Menu = Menu.Crawler;

  readonly messageCenter = markRaw(new MessageCenter());

  get crawlerManage() {
    return this._crawlerManage;
  }

  get clientManage() {
    return this._clientManage;
  }

  get currentMenu() {
    return this._currentMenu;
  }

  constructor() {
    this._crawlerManage = new CrawlerManage();
    this._clientManage = new ClientManage();
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
