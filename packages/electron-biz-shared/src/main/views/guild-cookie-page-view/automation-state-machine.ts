import type { Logger } from '@tk-crawler/shared';
import type { WebContents, WebContentsView } from 'electron';
import { InputEventFunctionStr } from '@tk-crawler/electron-utils/main';
import { getRandomArrayElement } from '@tk-crawler/shared';

const DEMO_ANCHOR = [
  'amyna.bou.sonko',
  'gracekelly_mcguire',
  'sephoratshalamukendi',
  'ainhoatoga0',
  'kadirlalgerien',
  'iaempresa',
];

// 定义自动化状态
enum AutomationState {
  INITIAL = 'INITIAL',
  FINDING_NAVIGATION = 'FINDING_NAVIGATION',
  FINDING_SCOUT_TAB = 'FINDING_SCOUT_TAB',
  FINDING_INVITE_BUTTON = 'FINDING_INVITE_BUTTON',
  INPUTTING_DEMO_ANCHORS = 'INPUTTING_DEMO_ANCHORS',
  INPUTTING_DEMO_ANCHORS_SUCCESS = 'INPUTTING_DEMO_ANCHORS_SUCCESS',
  CLICKING_NEXT = 'CLICKING_NEXT',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

// 定义操作结果接口
interface OperationResult {
  success: boolean;
  error?: string;
}

// 定义DOM元素接口
interface DOMElement {
  click: () => void;
  value?: string;
  dispatchEvent: (event: Event) => boolean;
  selector: string;
}

export class GuildCookiePageAutomationStateMachine {
  private _logger: Logger;
  private _thirdPartyView: WebContentsView;
  private _currentState: AutomationState = AutomationState.INITIAL;
  private _retryCount: number = 0;
  private _destroyed: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(props: { logger: Logger; thirdPartyView: WebContentsView }) {
    this._logger = props.logger;
    this._thirdPartyView = props.thirdPartyView;
  }

  // 执行JavaScript代码
  private async executeScript<T>(
    script: string,
    userGesture?: boolean,
  ): Promise<T> {
    const webContents = this._thirdPartyView.webContents as WebContents;
    return await webContents.executeJavaScript(script, userGesture);
  }

  // 查找元素
  private async findElement(selector: string): Promise<DOMElement | null> {
    const element = await this.executeScript<DOMElement | null>(`
      (function() {
        const element = document.querySelector('${selector}');
        if (element) {
          element.selector = '${selector}';
        }
        return element;
      })()
    `);
    return element;
  }

  // 点击元素
  private async clickElement(selector: string): Promise<boolean> {
    return await this.executeScript<boolean>(`
      (function() {
        const element = document.querySelector('${selector}');
        if (element) {
          element.click();
          return true;
        }
        return false;
      })()
    `);
  }

  // 输入文本
  private async inputText(selector: string, text: string): Promise<boolean> {
    return await this.executeScript<boolean>(`
      (function() {
        const element = document.querySelector('${selector}');
        if (element) {
          ${InputEventFunctionStr}
          inputEvent(element, '${text}');
          return true;
        }
        return false;
      })()
    `);
  }

  // 等待函数
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 检测当前状态
  private async detectCurrentState(): Promise<AutomationState> {
    if (this._currentState === AutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS) {
      const nextButton = await this.findElement(
        'button[data-id="invite-host-next"]',
      );
      if (nextButton) {
        return AutomationState.CLICKING_NEXT;
      }
    }

    const inviteHostTextArea = await this.findElement(
      'textarea[data-testid="inviteHostTextArea"]',
    );
    if (inviteHostTextArea) {
      return AutomationState.INPUTTING_DEMO_ANCHORS;
    }

    // 检查是否在邀请主播页面
    const inviteButton = await this.findElement(
      'button[data-id="agent-workplace-add-host"]',
    );
    if (inviteButton) {
      return AutomationState.FINDING_INVITE_BUTTON;
    }

    // 检查是否在Scout标签页
    const scoutTab = await this.findElement(
      '.semi-tabs[data-id="TodoTaskStageCard2"] #semiTab1',
    );
    if (scoutTab) {
      return AutomationState.FINDING_SCOUT_TAB;
    }

    // 检查是否在导航列表
    const navigationList = await this.findElement(
      '.semi-navigation-vertical .semi-navigation-list',
    );
    if (navigationList) {
      return AutomationState.FINDING_NAVIGATION;
    }

    // 如果都不符合，返回初始状态
    return AutomationState.INITIAL;
  }

  // 执行状态动作
  private async executeStateAction(): Promise<boolean> {
    try {
      // 检测当前状态
      const detectedState = await this.detectCurrentState();
      if (this._destroyed) {
        return false;
      }

      // 如果状态没有变化，不执行动作
      if (detectedState === this._currentState) {
        await this.sleep(200);
        return true;
      }

      if (this._destroyed) {
        return false;
      }

      this._currentState = detectedState;

      switch (this._currentState) {
        case AutomationState.FINDING_NAVIGATION: {
          const workspaceButtonSelector =
            '.semi-navigation-vertical .semi-navigation-list > *:first-child';
          return await this.clickElement(workspaceButtonSelector);
        }

        case AutomationState.FINDING_SCOUT_TAB: {
          const scoutTabSelector =
            '.semi-tabs[data-id="TodoTaskStageCard2"] #semiTab1';
          return await this.clickElement(scoutTabSelector);
        }

        case AutomationState.FINDING_INVITE_BUTTON: {
          const inviteButtonSelector =
            'button[data-id="agent-workplace-add-host"]';
          return await this.clickElement(inviteButtonSelector);
        }

        case AutomationState.INPUTTING_DEMO_ANCHORS: {
          const res = await this.inputText(
            'textarea[data-testid="inviteHostTextArea"]',
            getRandomArrayElement(DEMO_ANCHOR),
          );
          if (res) {
            this._currentState = AutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS;
          } else {
            return false;
          }
          break;
        }

        case AutomationState.CLICKING_NEXT: {
          const nextButtonSelector = 'button[data-id="invite-host-next"]';
          const res = await this.clickElement(nextButtonSelector);
          if (res) {
            this._currentState = AutomationState.COMPLETED;
          } else {
            return false;
          }
          break;
        }

        case AutomationState.COMPLETED:
          return true;

        case AutomationState.ERROR:
          return false;
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this._logger.error(`Error in state ${this._currentState}:`, errorMessage);
      return false;
    }
  }

  // 主执行方法
  public async execute(): Promise<OperationResult> {
    this._logger.info('Starting automation process');

    while (
      !this._destroyed &&
      this._currentState !== AutomationState.COMPLETED &&
      this._currentState !== AutomationState.ERROR
    ) {
      const success = await this.executeStateAction();
      if (this._destroyed) {
        break;
      }

      if (!success) {
        this._retryCount++;
        if (this._retryCount >= this.MAX_RETRIES) {
          this._currentState = AutomationState.ERROR;
          return {
            success: false,
            error: `Failed at state: ${this._currentState} after ${this.MAX_RETRIES} retries`,
          };
        }
        this._logger.warn(
          `Retry ${this._retryCount} for state ${this._currentState}`,
        );
        await this.sleep(this.RETRY_DELAY);
      }
    }

    if (this._destroyed) {
      return {
        success: false,
        error: 'Automation process destroyed',
      };
    }

    const result: OperationResult = {
      success: this._currentState === AutomationState.COMPLETED,
    };

    if (!result.success) {
      result.error = `Automation failed at state: ${this._currentState}`;
    }

    this._logger.info('Automation process completed', result);
    return result;
  }

  destroy() {
    this._destroyed = true;
  }
}
