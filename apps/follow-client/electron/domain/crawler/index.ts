import type { MessageCenter } from '@tk-crawler/shared';

export class MainPageManagement {
  private _messageCenter: MessageCenter;

  constructor(props: { messageCenter: MessageCenter }) {
    this._messageCenter = props.messageCenter;
  }

  async start() {}

  stop() {}

  clear() {
    this.stop();
  }
}
