import type { Logger } from '@tk-crawler/shared';
import type { WebContents, WebContentsView } from 'electron';
import { InputEventFunctionStr } from '@tk-crawler/electron-utils/main';
import { getRandomArrayElement } from '@tk-crawler/shared';
import { GuildCookiePageIsLoggedIn } from './types';

const DEMO_ANCHOR = [
  'amyna.bou.sonko',
  'gracekelly_mcguire',
  'sephoratshalamukendi',
  'ainhoatoga0',
  'kadirlalgerien',
  'iaempresa',
];

enum NotLoggedInAutomationState {
  CLICKING_LOGIN_BUTTON = 'not-logged-in:CLICKING_LOGIN_BUTTON',
  INPUTTING_LOGIN_FORM = 'not-logged-in:INPUTTING_LOGIN_FORM',
  INPUTTING_LOGIN_FORM_SUCCESS = 'not-logged-in:INPUTTING_LOGIN_FORM_SUCCESS',
  CLICKING_LOGIN_SUBMIT_BUTTON = 'not-logged-in:CLICKING_LOGIN_SUBMIT_BUTTON',
  FINISHED = 'not-logged-in:FINISHED',
}

enum LoggedInAutomationState {
  INITIAL = 'logged-in:LOGGED_IN_INITIAL',
  FINDING_NAVIGATION = 'logged-in:FINDING_NAVIGATION',
  FINDING_SCOUT_TAB = 'logged-in:FINDING_SCOUT_TAB',
  FINDING_INVITE_BUTTON = 'logged-in:FINDING_INVITE_BUTTON',
  INPUTTING_DEMO_ANCHORS = 'logged-in:INPUTTING_DEMO_ANCHORS',
  INPUTTING_DEMO_ANCHORS_SUCCESS = 'logged-in:INPUTTING_DEMO_ANCHORS_SUCCESS',
  CLICKING_NEXT = 'logged-in:CLICKING_NEXT',
  CLICKING_NEXT_SUCCESS = 'logged-in:CLICKING_NEXT_SUCCESS',
}

enum CommonAutomationState {
  INITIAL = 'INITIAL',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

type AutomationState =
  | NotLoggedInAutomationState
  | LoggedInAutomationState
  | CommonAutomationState;

// 定义操作结果接口
interface OperationResult {
  success: boolean;
  error?: string;
}

export class GuildCookiePageAutomationStateMachine {
  private _username: string;
  private _password: string;
  private _logger: Logger;
  private _thirdPartyView: WebContentsView;

  private _currentState: AutomationState = CommonAutomationState.INITIAL;

  private _isLoggedIn: GuildCookiePageIsLoggedIn =
    GuildCookiePageIsLoggedIn.UNKNOWN;

  private _retryCount: number = 0;
  private _destroyed: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(props: {
    logger: Logger;
    thirdPartyView: WebContentsView;
    username: string;
    password: string;
  }) {
    this._logger = props.logger;
    this._thirdPartyView = props.thirdPartyView;
    this._username = props.username;
    this._password = props.password;
  }

  get isLoggedIn() {
    return this._isLoggedIn;
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
  private async findElement(selector: string): Promise<object | null> {
    const element = await this.executeScript<object | null>(`
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

  private async detectIsLoggedIn(): Promise<GuildCookiePageIsLoggedIn> {
    const avatarElem = await this.findElement('.semi-avatar-circle');
    if (avatarElem) {
      return GuildCookiePageIsLoggedIn.LOGGED_IN;
    }
    const loginButton = await this.findElement('button[data-id="login"]');
    if (loginButton) {
      return GuildCookiePageIsLoggedIn.NOT_LOGGED_IN;
    }
    return GuildCookiePageIsLoggedIn.UNKNOWN;
  }

  // 检测当前状态
  private async detectCurrentState(): Promise<AutomationState> {
    this._isLoggedIn = await this.detectIsLoggedIn();
    if (this._isLoggedIn === GuildCookiePageIsLoggedIn.UNKNOWN) {
      return CommonAutomationState.INITIAL;
    }
    if (this._isLoggedIn === GuildCookiePageIsLoggedIn.NOT_LOGGED_IN) {
      if (this._currentState === NotLoggedInAutomationState.FINISHED) {
        return NotLoggedInAutomationState.FINISHED;
      }
      if (
        this._currentState ===
        NotLoggedInAutomationState.INPUTTING_LOGIN_FORM_SUCCESS
      ) {
        const loginSubmitButton = await this.findElement(
          'button[data-id="login-primary-button"]',
        );
        if (loginSubmitButton) {
          return NotLoggedInAutomationState.CLICKING_LOGIN_SUBMIT_BUTTON;
        }
        return NotLoggedInAutomationState.INPUTTING_LOGIN_FORM_SUCCESS;
      }
      const emailInput = await this.findElement(
        'form[data-id="login-form-login-email"] #email',
      );
      const passwordInput = await this.findElement(
        'form[data-id="login-form-login-email"] #password',
      );
      if (emailInput && passwordInput) {
        return NotLoggedInAutomationState.INPUTTING_LOGIN_FORM;
      }
      return NotLoggedInAutomationState.CLICKING_LOGIN_BUTTON;
    }
    if (this._currentState === LoggedInAutomationState.CLICKING_NEXT_SUCCESS) {
      if (
        await this.findElement(
          'div[data-id="host-info"] div[data-id="host-table"]',
        )
      ) {
        return CommonAutomationState.COMPLETED;
      }
      return LoggedInAutomationState.CLICKING_NEXT_SUCCESS;
    }
    if (this._currentState === LoggedInAutomationState.CLICKING_NEXT) {
      return LoggedInAutomationState.CLICKING_NEXT;
    }
    if (
      this._currentState ===
      LoggedInAutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS
    ) {
      const nextButton = await this.findElement(
        'button[data-id="invite-host-next"]',
      );
      if (nextButton) {
        return LoggedInAutomationState.CLICKING_NEXT;
      }
      return LoggedInAutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS;
    }

    const inviteHostTextArea = await this.findElement(
      'textarea[data-testid="inviteHostTextArea"]',
    );
    if (inviteHostTextArea) {
      return LoggedInAutomationState.INPUTTING_DEMO_ANCHORS;
    }

    // 检查是否在邀请主播页面
    const inviteButton = await this.findElement(
      'button[data-id="agent-workplace-add-host"]',
    );
    if (inviteButton) {
      return LoggedInAutomationState.FINDING_INVITE_BUTTON;
    }

    // 检查是否在Scout标签页
    const scoutTab = await this.findElement(
      '.semi-tabs[data-id="TodoTaskStageCard2"] #semiTab1',
    );
    if (scoutTab) {
      return LoggedInAutomationState.FINDING_SCOUT_TAB;
    }

    // 检查是否在导航列表
    const navigationList = await this.findElement(
      '.semi-navigation-vertical .semi-navigation-list',
    );
    if (navigationList) {
      return LoggedInAutomationState.FINDING_NAVIGATION;
    }

    // 如果都不符合，返回初始状态
    return LoggedInAutomationState.INITIAL;
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
        await this.sleep(300);
        return true;
      }

      if (this._destroyed) {
        return false;
      }

      this._currentState = detectedState;

      switch (this._currentState) {
        case NotLoggedInAutomationState.CLICKING_LOGIN_BUTTON: {
          const loginButtonSelector = 'button[data-id="login"]';
          return await this.clickElement(loginButtonSelector);
        }

        case NotLoggedInAutomationState.INPUTTING_LOGIN_FORM: {
          const emailInputSelector =
            'form[data-id="login-form-login-email"] #email';
          if (!(await this.inputText(emailInputSelector, this._username))) {
            return false;
          }
          const passwordInputSelector =
            'form[data-id="login-form-login-email"] #password';
          if (!(await this.inputText(passwordInputSelector, this._password))) {
            return false;
          }
          await this._thirdPartyView.webContents.executeJavaScript(`
            (async function() {
              const passwordInput = document.querySelector('form[data-id="login-form-login-email"] #password');
              if (!passwordInput) {
                return;
              }
              const passwordIcon = passwordInput.nextElementSibling?.querySelector('.semi-icon');
              if (passwordIcon) {
                passwordIcon.click();
              }
            })();
          `);
          this._currentState =
            NotLoggedInAutomationState.INPUTTING_LOGIN_FORM_SUCCESS;
          return true;
        }

        case NotLoggedInAutomationState.INPUTTING_LOGIN_FORM_SUCCESS: {
          return true;
        }

        case NotLoggedInAutomationState.CLICKING_LOGIN_SUBMIT_BUTTON: {
          const loginSubmitButtonSelector =
            'button[data-id="login-primary-button"]';
          const res = await this.clickElement(loginSubmitButtonSelector);
          if (res) {
            this._currentState = NotLoggedInAutomationState.FINISHED;
          } else {
            return false;
          }
          break;
        }

        case LoggedInAutomationState.FINDING_NAVIGATION: {
          const workspaceButtonSelector =
            '.semi-navigation-vertical .semi-navigation-list > *:first-child';
          return await this.clickElement(workspaceButtonSelector);
        }

        case LoggedInAutomationState.FINDING_SCOUT_TAB: {
          const scoutTabSelector =
            '.semi-tabs[data-id="TodoTaskStageCard2"] #semiTab1';
          return await this.clickElement(scoutTabSelector);
        }

        case LoggedInAutomationState.FINDING_INVITE_BUTTON: {
          const inviteButtonSelector =
            'button[data-id="agent-workplace-add-host"]';
          return await this.clickElement(inviteButtonSelector);
        }

        case LoggedInAutomationState.INPUTTING_DEMO_ANCHORS: {
          const res = await this.inputText(
            'textarea[data-testid="inviteHostTextArea"]',
            getRandomArrayElement(DEMO_ANCHOR),
          );
          if (res) {
            this._currentState =
              LoggedInAutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS;
          } else {
            return false;
          }
          break;
        }

        case LoggedInAutomationState.INPUTTING_DEMO_ANCHORS_SUCCESS: {
          return true;
        }

        case LoggedInAutomationState.CLICKING_NEXT: {
          const nextButtonSelector = 'button[data-id="invite-host-next"]';
          const res = await this.clickElement(nextButtonSelector);
          if (res) {
            this._currentState = LoggedInAutomationState.CLICKING_NEXT_SUCCESS;
          } else {
            return false;
          }
          break;
        }

        case CommonAutomationState.COMPLETED:
          return true;

        case CommonAutomationState.ERROR:
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
      this._currentState !== CommonAutomationState.COMPLETED &&
      this._currentState !== CommonAutomationState.ERROR
    ) {
      const success = await this.executeStateAction();
      if (this._destroyed) {
        break;
      }

      if (!success) {
        this._retryCount++;
        if (this._retryCount >= this.MAX_RETRIES) {
          this._currentState = CommonAutomationState.ERROR;
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
      success: this._currentState === CommonAutomationState.COMPLETED,
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
