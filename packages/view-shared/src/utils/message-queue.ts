import type { MessageHandler } from 'element-plus';
import { ElMessage } from 'element-plus';

interface QueueMessage {
  id: number;
  timestamp: number;
  instance: MessageHandler;
}

export class MessageQueue {
  private _messageQueue: QueueMessage[] = [];
  private readonly MAX_MESSAGES: number;
  private readonly MESSAGE_DURATION: number;

  private readonly MESSAGE_OFFSET: number;

  constructor(props?: {
    maxMessages?: number;
    messageDuration?: number;
    messageOffset?: number;
  }) {
    this.MAX_MESSAGES = props?.maxMessages ?? 10;
    this.MESSAGE_DURATION = props?.messageDuration ?? 5000;
    this.MESSAGE_OFFSET = props?.messageOffset ?? 30;
  }

  showMessage(data: {
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }) {
    const messageId = Math.random();
    const message = {
      id: messageId,
      timestamp: Date.now(),
      instance: ElMessage({
        message: data.message,
        type: data.type as any,
        duration: this.MESSAGE_DURATION,
        showClose: false,
        offset: this.MESSAGE_OFFSET,
        plain: true,
        onClose: () => {
          this._messageQueue = this._messageQueue.filter(
            msg => msg.id !== messageId,
          );
        },
      }),
    };

    // Add to queue
    this._messageQueue.push(message);

    if (this._messageQueue.length > this.MAX_MESSAGES) {
      // Close the oldest notification
      this._messageQueue[0]?.instance.close();
    }
  }

  clearMessages() {
    // Close all notifications
    this._messageQueue.forEach(msg => {
      msg.instance.close();
    });
    this._messageQueue = [];
  }
}
