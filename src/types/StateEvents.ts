export interface IErrorCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err: any): void;
}

export interface ICallback<T> {
  (value: T): void;
}

export interface IStateEvents<T> {
  subscribe(callback: ICallback<T>, onError?: IErrorCallback | null): void;
  unsubscribe(callback: ICallback<T>): void;
  unsubscribeAll(): void;
  getCurrent(): T;
  publish(data: T): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(err: any): void;
}
