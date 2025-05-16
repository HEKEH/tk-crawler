import type { Runner } from './types';
import { Area, getRegionsByArea } from '@tk-crawler/biz-shared';
import { logger } from '../infra/logger';
import { updateAnchorArea } from '../services/anchor-area-update';

const AREAS = Object.values(Area);
logger.info('[AREAS]', AREAS);

export class AreaUpdateRunner implements Runner {
  private _areas: Area[] = AREAS;
  private _areaIndex = 0;
  private _regionIndex = 0;
  private _errorCount = 0;
  // private async _restoreAnchorsArea(): Promise<{
  //   error: boolean;
  //   end: boolean;
  // }> {
  //   try {
  //     const result = await restoreAnchorArea();
  //     const end = result.count === 0;
  //     return { error: false, end };
  //   } catch (error) {
  //     logger.error('[restoreAnchorArea error]', error);
  //     this._errorCount++;
  //     return { error: true, end: false };
  //   }
  // }

  private async _updateAnchorsArea(): Promise<{
    error: boolean;
    end: boolean;
  }> {
    try {
      const area = this._areas[this._areaIndex];
      const regions = getRegionsByArea(area);
      const region = regions[this._regionIndex];
      const result = await updateAnchorArea(region);
      const end = result.count === 0;
      if (end) {
        if (this._regionIndex >= regions.length - 1) {
          if (this._areaIndex >= this._areas.length - 1) {
            return { error: false, end: true };
          }
          this._areaIndex++;
          this._regionIndex = 0;
        } else {
          this._regionIndex++;
        }
      }
      // if (end) {
      //   this._stage = 'restore';
      // }
      return { error: false, end: false };
    } catch (error) {
      logger.error('[updateAnchorArea error]', error);
      this._errorCount++;
      return { error: true, end: false };
    }
  }

  async run(): Promise<{
    success: boolean;
    end: boolean;
  }> {
    logger.info('UpdateArea is running');
    // const { error, end } =s
    //   this._stage === 'update'
    //     ? await this._updateAnchorsArea()
    //     : await this._restoreAnchorsArea();
    const { error, end } = await this._updateAnchorsArea();
    if (end) {
      return { success: true, end: true };
    }
    if (error) {
      logger.error('UpdateArea is running error:', {
        errorCount: this._errorCount,
      });
      if (this._errorCount > 20) {
        return { success: false, end: true };
      }
      await new Promise(resolve => setTimeout(resolve, 20000)); // 10s之后再重试
      return { success: false, end: false };
    }
    this._errorCount = 0;

    return { success: true, end: false };
  }
}
