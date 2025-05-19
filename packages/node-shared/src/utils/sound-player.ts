import type { Logger } from '@tk-crawler/shared';
import { play } from 'sound-play';

export class SoundPlayer {
  private static instance: SoundPlayer;

  private _volume: number = 1;

  private constructor() {}

  static getInstance() {
    if (!SoundPlayer.instance) {
      SoundPlayer.instance = new SoundPlayer();
    }
    return SoundPlayer.instance;
  }

  async play({
    soundPath,
    logger,
    volume,
    times = 1,
  }: {
    soundPath: string;
    logger?: Logger;
    volume?: number;
    times?: number;
  }) {
    try {
      while (times > 0) {
        await play(soundPath, volume ?? this._volume);
        times--;
      }
    } catch (error) {
      logger?.error('Error play:', error);
    }
  }

  // 设置音量
  setVolume(volume: number) {
    this._volume = volume;
  }
}
