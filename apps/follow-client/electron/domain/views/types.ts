export interface IView {
  show: () => Promise<void>;
  close: () => void;
  destroy: () => void;
}
