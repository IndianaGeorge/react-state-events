export interface IErrorCallback {
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
  error(err: any): void;
}
