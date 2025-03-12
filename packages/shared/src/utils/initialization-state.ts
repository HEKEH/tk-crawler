enum State {
  uninitialized = 'uninitialized',
  initializing = 'initializing',
  initialized = 'initialized',
}

export class InitializationState {
  private _state: State = State.uninitialized;

  private _onInitializedCallbacks: (() => void)[] = [];

  get isInitialized() {
    return this._state === State.initialized;
  }

  get isPending() {
    return this._state === State.initializing;
  }

  initializeBegin() {
    this._state = State.initializing;
  }

  initializeComplete() {
    this._state = State.initialized;
    this._onInitializedCallbacks.forEach(callback => callback());
    this._onInitializedCallbacks = [];
  }

  reset() {
    this._state = State.uninitialized;
  }

  onInitialized(): Promise<void> | void {
    // 如果已经就绪，那么直接返回
    if (this.isInitialized) {
      return;
    }
    return new Promise(resolve => {
      this._onInitializedCallbacks.push(() => {
        resolve();
      });
    });
  }
}
