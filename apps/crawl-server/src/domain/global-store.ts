import { redisMessageBus } from '@tk-crawler/database';
import { OrganizationCollection } from './organization/organization-collection';

const UPDATE_INTERVAL = 1000 * 60 * 20; // 20分钟自动更新一次

export class GlobalStore {
  private readonly _organizationCollection: OrganizationCollection =
    new OrganizationCollection();

  private _updateInterval: NodeJS.Timeout | undefined;

  async init() {
    await this._organizationCollection.init();
    this._updateInterval = setInterval(() => {
      this.update();
    }, UPDATE_INTERVAL);
  }

  async update() {
    await this._organizationCollection.update();
  }

  async destroy() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = undefined;
    }
    await this._organizationCollection.destroy();
    await redisMessageBus.quit();
  }
}
