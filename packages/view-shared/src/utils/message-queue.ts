import type { MessageHandler } from 'element-plus';
import { ElMessage } from 'element-plus';

interface QueueMessage {
  id: number;
  timestamp: number;
  instance: MessageHandler | undefined;
}

export class MessageQueue {
  private _isPageActive = true;

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
    this._setupEventListeners();
  }

  private _setupEventListeners() {
    // 页面可见性变化
    document.addEventListener('visibilitychange', this._handleVisibilityChange);

    // 页面冻结/恢复（包括休眠）
    document.addEventListener('freeze', this._handleFreeze);
    document.addEventListener('resume', this._handleResume);

    // // 窗口焦点变化
    // window.addEventListener('blur', this._handleBlur);
    // window.addEventListener('focus', this._handleFocus);

    // 页面卸载前清理
    window.addEventListener('beforeunload', this._cleanupListeners);
  }

  private _handleVisibilityChange = () => {
    this._isPageActive = document.visibilityState === 'visible';
  };

  private _handleFreeze = () => {
    this._isPageActive = false;
    this.clearMessages();
  };

  private _handleResume = () => {
    this._isPageActive = true;
  };

  // private _handleBlur = () => {
  //   this._isPageActive = false;
  //   this.clearMessages();
  // };

  // private _handleFocus = () => {
  //   this._isPageActive = true;
  // };

  showMessage(data: {
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }) {
    if (!this._isPageActive) {
      return;
    }
    const messageId = Math.random();
    const message: QueueMessage = {
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
          message.instance = undefined;
        },
      }),
    };

    // Add to queue
    this._messageQueue.push(message);

    if (this._messageQueue.length > this.MAX_MESSAGES) {
      // Close the oldest notification
      const firstMessage = this._messageQueue[0];
      if (firstMessage) {
        firstMessage.instance?.close();
      }
    }
  }

  private _cleanupListeners = () => {
    // 移除所有事件监听
    document.removeEventListener(
      'visibilitychange',
      this._handleVisibilityChange,
    );
    document.removeEventListener('freeze', this._handleFreeze);
    document.removeEventListener('resume', this._handleResume);
    // window.removeEventListener('blur', this._handleBlur);
    // window.removeEventListener('focus', this._handleFocus);
    window.removeEventListener('beforeunload', this._cleanupListeners);
  };

  clearMessages() {
    this._messageQueue.forEach(msg => {
      msg.instance?.close();
    });
    this._messageQueue = [];
  }

  destroy() {
    this._cleanupListeners();
    // Close all notifications
    this.clearMessages();
  }
}
