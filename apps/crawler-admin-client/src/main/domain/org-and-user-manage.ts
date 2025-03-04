import { OrgAndUserMenu } from '../types';

export default class OrgAndUserManage {
  private _currentMenu: OrgAndUserMenu = OrgAndUserMenu.Org;

  get currentMenu() {
    return this._currentMenu;
  }

  setCurrentMenu(menu: OrgAndUserMenu) {
    this._currentMenu = menu;
  }

  constructor() {}
}
