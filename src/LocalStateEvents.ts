import type { IStateEvents, ICallback, IErrorCallback } from "./types/StateEvents";

export default class LocalStateEvents<T> implements IStateEvents<T> {
  current: T;
  streamId: string;
  allowDebug: boolean;
  constructor(initial: T, debugName?: string, allowDebug: boolean = false) {
    this.current = initial;
    const streamId = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(8))));
    const finalDebugName = debugName || `${streamId}`;
    this.streamId = streamId;
    this.allowDebug = allowDebug && typeof window !== 'undefined';
    if (this.allowDebug) {
      setTimeout(function () {
        window.postMessage(
          {
            type: 'react-state-event-devTool-streamId',
            payload: {
              debugName: finalDebugName,
              streamType: 'LocalStateEvents',
            },
            id: streamId,
            init: initial
          },
          '*'
        );
      }, 1000);
      window.addEventListener('message', (event) => {
        if (
          event.origin !== window.origin ||
          event.source !== window ||
          event.data.type !== 'react-state-event-devTool-set' ||
          event.data.id !== this.streamId
        ) {
          return;
        }
        this.current = event.data.payload;
        this.callHandlers(event.data.payload);
      });
    }
  }

  handlers: { callback: ICallback<T>, onError: IErrorCallback | null}[] = [];
  subscribe(callback: ICallback<T>, onError: IErrorCallback | null = null): void {
    this.handlers.push({ callback, onError });
  }

  unsubscribe(callback: ICallback<T>): void {
    this.handlers = this.handlers.filter(
      (handler) => handler.callback !== callback
    );
  }

  unsubscribeAll(): void {
    this.handlers = [];
  }

  getCurrent(): T {
    return this.current;
  }

  publish(data: T): void {
    this.current = data;
    if (this.allowDebug) {
      window.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'LocalStateEvents',
            streamId: this.streamId,
            success: true,
            value: data
          }
        },
        '*'
      );
    }
    this.callHandlers(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(err: any): void {
    if (this.allowDebug) {
      window.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'LocalStateEvents',
            streamId: this.streamId,
            success: false,
            value: err
          }
        },
        '*'
      );
    }
    this.handlers.forEach((handler) => {
      if (handler.onError) {
        handler.onError(err);
      } else {
        throw err;
      }
    });
  }

  callHandlers(data: T): void {
    this.handlers.forEach((handler) => {
      try {
        handler.callback(data);
      } catch (err) {
        if (handler.onError && err instanceof Error) {
          handler.onError(err);
        } else {
          throw err;
        }
      }
    });
  }
}
