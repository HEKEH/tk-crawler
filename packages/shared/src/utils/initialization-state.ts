enum State {
  uninitialized = 'uninitialized',
  initializing = 'initializing',
  initialized = 'initialized',
  initializeError = 'initializeError',
}

export class InitializationState {
  private _state: State = State.uninitialized;

  private _onInitializedCallbacks: (() => void)[] = [];

  private _onInitializeErrorCallbacks: ((error: Error) => void)[] = [];

  get isInitialized() {
    return this._state === State.initialized;
  }

  get isPending() {
    return this._state === State.initializing;
  }

  get hasInitializeError() {
    return this._state === State.initializeError;
  }

  initializeBegin() {
    this._state = State.initializing;
  }

  initializeComplete() {
    this._state = State.initialized;
    this._onInitializeErrorCallbacks = [];
    this._onInitializedCallbacks.forEach(callback => callback());
    this._onInitializedCallbacks = [];
  }

  initializeError(error: Error) {
    this._state = State.initializeError;
    this._onInitializedCallbacks = [];
    this._onInitializeErrorCallbacks.forEach(callback => callback(error));
    this._onInitializeErrorCallbacks = [];
  }

  reset() {
    this._state = State.uninitialized;
  }

  onInitialized(): Promise<void> | void {
    // 如果已经就绪，那么直接返回
    if (this.isInitialized) {
      return;
    }
    return new Promise((resolve, reject) => {
      this._onInitializedCallbacks.push(resolve);
      this._onInitializeErrorCallbacks.push(reject);
    });
  }
}
