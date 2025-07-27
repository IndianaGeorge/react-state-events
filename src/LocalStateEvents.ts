import type { IStateEvents, ICallback, IErrorCallback } from "./types/StateEvents";
import type { IDebugEvent, DebugListener } from './debugHelper';

import { debugAnnounce, debugAddListener, debugRemoveListener, debugSend } from "./debugHelper";

const streamType = 'LocalStateEvents';

export default class LocalStateEvents<T> implements IStateEvents<T> {
  current: T;
  streamId: string;
  allowDebug: boolean;
  debugListener: DebugListener<IDebugEvent<T>> | null;
  constructor(initial: T, debugName?: string, allowDebug: boolean = false) {
    this.current = initial;
    const streamId = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(8))));
    const finalDebugName = debugName || `${streamId}`;
    this.streamId = streamId;
    this.allowDebug = allowDebug && typeof window !== 'undefined';
    this.debugListener = null;
    if (this.allowDebug) {
      debugAnnounce<T>(finalDebugName, streamType, streamId, initial);
      this.debugListener = debugAddListener<T>(streamId, streamType, (value: T) => {
        this.current = value;
        this.callHandlers(value);
      })
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
    if (this.allowDebug && this.debugListener) {
      debugRemoveListener(this.debugListener);
    }
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
      debugSend(this.streamId, streamType, true, data);
    }
    this.callHandlers(data);
  }

  error(err: any): void {
    if (this.allowDebug) {
      debugSend(this.streamId, streamType, false, err);
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
