import type { IStateEvents, ICallback, IErrorCallback } from './types/StateEvents';
import type { IMessageHandler } from './types/EventHandlers';
import type { IDebugEvent, DebugListener } from './debugHelper';

import { debugAnnounce, debugAddListener, debugRemoveListener, debugSend } from "./debugHelper";

const initTimeoutMiliseconds = 500;
const streamType = 'MessageStateEvents';

type Target = {
  source: Window;
  origin: string;
}

export interface IMessageStateEventsOptions {
  targets?: Target[];
};

export default class MessageStateEvents<T> implements IStateEvents<T> {
  /** @deprecated For internal use only. */
  instanceId: string;
  /** @deprecated Use `getCurrent()` instead. */
  current: T;
  /** @deprecated For internal use only. */
  name: string;
  /** @deprecated For internal use only. */
  initTimer: ReturnType<typeof setTimeout> | null;
  /** @deprecated For internal use only. */
  timestamp: number | null;
  /** @deprecated For internal use only. */
  callbacks: {callback: ICallback<T>, onError: IErrorCallback | null}[];
  /** @deprecated For internal use only. */
  handler: {callback: ICallback<T>, wrappedCallback: IMessageHandler, onError: IErrorCallback | null, debugHandler: DebugListener<IDebugEvent<T>> | null} | null;
  /** @deprecated For internal use only. */
  targets: Target[];
  /** @deprecated For internal use only. */
  allowDebug: boolean;
  constructor(initial: T, name: string, options: IMessageStateEventsOptions | boolean = {}, allowDebug = false) {
    this.instanceId = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(8))));
    this.current = initial;
    this.name = name;
    this.initTimer = null;
    this.timestamp = null;
    this.callbacks = []; // the callbacks user send
    this.handler = null; // the actual handler we registered, wrapping the callback
    if (options === true || options === false) {
      this.allowDebug = options && typeof window !== 'undefined';
      this.targets = [];
    } else {
      this.allowDebug = allowDebug && typeof window !== 'undefined';
      this.targets = options.targets  || [];
    }
  }

  subscribe(callback: ICallback<T>, onError: IErrorCallback | null = null) {
    this.callbacks.push({ callback, onError });
    if (this.callbacks.length === 1 && typeof window !== 'undefined') {
      const wrappedCallback = (event: MessageEvent) => {
        this.targets = this.targets.filter((target)=>!target.source.closed); // remove closed windows from target list
        const msgSourceTarget = this.targets.find((target: Target) => target.source === event.source); // find target entry for this event by source
        if ( // Message will NOT be processed if:
          !event.data?.instanceId || // doesn't have an instance id
          !event.data?.type || // it doesn't have an event type
          event.data?.name !== this.name || // it's not our stream
          ((event.source !== window) && !msgSourceTarget) || // it's not from current window and not in targets
          (msgSourceTarget && (msgSourceTarget.origin !== '*') && (event.origin !== msgSourceTarget.origin)) // it's from targets but with a different origin
        ) {
          return;
        }
        switch (event.data.type) {
          case 'message-state-events-initresponse':
            if (event.data.success) {
              if (this.isInitialized() || this.instanceId === event.data.instanceId) {
                return;
              }
              this.current = event.data.payload;
              this.initialize();
              if (msgSourceTarget) { // if from a target, repost to all targets but the source or current
                const allTargets: Target[] = this.targets.filter((target) => target.source !== msgSourceTarget.source);
                allTargets.forEach((target) => {
                  target.source.postMessage(
                    {
                      type: 'message-state-events-initresponse',
                      name: this.name,
                      success: true,
                      payload: event.data.payload,
                      timing: event.data.timing,
                      instanceId: this.instanceId,
                      },
                    target.origin
                  );
                });
              }
            }
            break;
          case 'message-state-events-event':
            if (this.instanceId !== event.data.instanceId) { // don't repost ANY of our own messages
              if (msgSourceTarget) { // the event came from a known different window, so send to all other targets
                const allTargets: Target[] = this.targets.filter((target) =>  target.source !== msgSourceTarget?.source); // don't repost to the sender
                allTargets.push({ source: window, origin: window.origin }); // repost for this window, we validated the source and others didn't
                allTargets.forEach((target) => {
                  target.source.postMessage(
                    {
                      type: 'message-state-events-event',
                      name: this.name,
                      success: event.data.success,
                      payload: event.data.payload,
                      instanceId: this.instanceId, // we reposted it!
                    },
                    target.origin
                  );
                });
                /* the repost will debug so we won't do it here
                if (this.allowDebug) {
                  // the event came from a different window, so send to this window's debug tool
                  debugSend(this.name, streamType, event.data.success, event.data.payload);
                }
                */
                return; // we'll handle the local window repost instead, since it's mandatory anyway
              } else {
                if (this.targets.length > 0) { // repost msg from other instance in this window to target windows
                  const allTargets: Target[] = [...this.targets];
                  allTargets.forEach((target) => {
                    target.source.postMessage(
                      {
                        type: 'message-state-events-event',
                        name: this.name,
                        success: event.data.success,
                        payload: event.data.payload,
                        instanceId: this.instanceId, // doesn't matter, as targets won't have this instance
                      },
                      target.origin
                    );
                  });
                }
              }
            }
            this.initialize();
            break;
          case 'message-state-events-initrequest':
            if (this.instanceId !== event.data.instanceId) {
              // we're not attending our own request
              if (this.isInitialized()) {
                if (this.timestamp !== null && this.timestamp < event.data.timing) {
                  // we initialized before request, so respond (to originating window)
                  const newTarget: Target = msgSourceTarget ? msgSourceTarget : {source: window, origin: window.origin};
                  newTarget.source.postMessage(
                    {
                      type: 'message-state-events-initresponse',
                      name: this.name,
                      success: true,
                      payload: this.current,
                      timing: this.timestamp,
                      instanceId: this.instanceId,
                    },
                    newTarget.origin // our allowed origin for that target
                  );
                }
              } else { // if not initialized and not from self, repost to all targets but the source or current
                  const allTargets: Target[] = this.targets.filter((target) =>  target.source !== msgSourceTarget?.source);
                  allTargets.forEach((target) => {
                    target.source.postMessage(
                      {
                        type: 'message-state-events-initrequest',
                        name: this.name,
                        timing: event.data.timing,
                        init: event.data.init,
                        instanceId: this.instanceId,
                        },
                      target.origin
                    );
                  });
              }
            }
            return;
          default:
            return;
        }
        if (event.data.success) {
          try {
            this.current = event.data.payload;
            callback(event.data.payload);
          } catch (err) {
            if (onError && err instanceof Error) {
              onError(err);
            } else {
              throw err;
            }
          }
        } else {
          if (onError) {
            onError(event.data.payload);
          } else {
            throw event.data.payload;
          }
        }
      };
      const boundWrappedCallback = wrappedCallback.bind(this);
      const setAndTrigger = (value: T) => {
        this.current = value;
        this.initialize();
        callback(value);
      }
      this.handler = {
        callback,
        wrappedCallback: boundWrappedCallback,
        onError,
        debugHandler: this.allowDebug ? debugAddListener<T>(this.name, streamType, setAndTrigger.bind(this)) : null,
      };
      window.addEventListener('message', boundWrappedCallback, true);
      const allTargets: Target[] = [...this.targets, {source: window, origin: window.origin}];
      allTargets.forEach((target) => {
        target.source.postMessage(
          {
            type: 'message-state-events-initrequest',
            name: this.name,
            timing: Date.now(),
            init: this.current,
            instanceId: this.instanceId,
          },
          target.origin
        );
      });
      const initTimeout = () => {
        if (this.allowDebug) {
          debugAnnounce(this.name, streamType, this.name, this.current);
        }
        this.initialize();
      };
      this.initTimer = setTimeout(initTimeout.bind(this), initTimeoutMiliseconds);
    }
  }

  isInitialized() {
    return this.timestamp !== null;
  }

  initialize() {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
      this.timestamp = Date.now();
    }
  }

  uninitialize() {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
      this.timestamp = null;
    }
  }

  unsubscribe(callback: ICallback<T>) {
    const handler = this.callbacks.find(
      (handler) => handler.callback === callback
    );
    if (handler) {
      this.callbacks = this.callbacks.filter(
        (handler) => handler.callback !== callback
      );
      if (this.callbacks.length === 0 && typeof window !== 'undefined') {
        const { wrappedCallback } = this.handler!;
        window.removeEventListener('message', wrappedCallback, true);
        if (this.allowDebug && this.handler?.debugHandler) {
          debugRemoveListener(this.handler.debugHandler);
        }
        this.handler = null;
        this.uninitialize();
      }
    }
  }

  unsubscribeAll() {
    if (this.handler && typeof window !== 'undefined') {
      const { wrappedCallback } = this.handler;
      window.removeEventListener('message', wrappedCallback, true);
      this.callbacks = [];
      if (this.allowDebug && this.handler?.debugHandler) {
        debugRemoveListener(this.handler.debugHandler);
      }
      this.handler = null;
      this.uninitialize();
    }
  }

  getCurrent() {
    return this.current;
  }

  publish(data: T) {
    this.current = data;
    if (typeof window !== 'undefined') {
      const allTargets: Target[] = [...this.targets, {source: window, origin: window.origin}]; // send now because we won't repost our own msgs
      allTargets.forEach((target) => {
        target.source.postMessage(
          {
            type: 'message-state-events-event',
            name: this.name,
            success: true,
            payload: data,
            instanceId: this.instanceId,
          },
          target.origin
        );
      });
      if (this.allowDebug) {
        debugSend(this.name, streamType, true, data);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(err: any) {
    if (typeof window !== 'undefined') {
      const allTargets: Target[] = [...this.targets, {source: window, origin: window.origin}];
      allTargets.forEach((target) => {
        target.source.postMessage(
          {
            type: 'message-state-events-event',
            name: this.name,
            success: false,
            payload: err,
            instanceId: this.instanceId,
          },
          target.origin
        );
      });
      if (this.allowDebug) {
        debugSend(this.name, streamType, false, err);
      }
    }
  }

  addTarget(source: Window, origin: string = '*') {
    // never add own window
    if (source !== window) {
      this.targets.push({source, origin});
    }
  }

  removeTarget(source: Window) {
    // never remove own window
    if (source !== window) {
      this.targets = this.targets.filter((target) => target.source !== source);
    }
  }
}
