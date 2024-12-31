export interface IErrorCallback {
  (err: Error): void;
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
  error(err: Error): void;
}
