let streamCounter = 0;

export default class StateEvents {
  constructor(initial, debugName = false, allowDebug = false) {
    this.current = initial;
    const streamId = String(++streamCounter);
    const finalDebugName = debugName || `${streamId}`;
    this.streamId = streamId;
    const boolAllowDebug = !!allowDebug;
    this.allowDebug = boolAllowDebug &&
      globalThis?.window?.postMessage &&
      globalThis?.window?.addEventListener &&
      globalThis?.window?.origin;
    if (this.allowDebug) {
      setTimeout(function () {
        globalThis.window?.postMessage(
          {
            type: 'react-state-event-devTool-streamId',
            payload: finalDebugName,
            id: streamId,
            init: initial
          },
          '*'
        );
      }, 1000);
      globalThis.window?.addEventListener('message', (event) => {
        if (
          event.origin !== globalThis.window?.origin ||
          event.source !== globalThis.window ||
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

  handlers = [];
  subscribe(callback, onError) {
    this.handlers.push({ callback, onError });
  }

  unsubscribe(callback) {
    this.handlers = this.handlers.filter(
      (handler) => handler.callback !== callback
    );
  }

  unsubscribeAll() {
    this.handlers = [];
  }

  getCurrent() {
    return this.current;
  }

  publish(data) {
    this.current = data;
    if (this.allowDebug) {
      globalThis.window?.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'StateEvents',
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

  error(err) {
    if (this.allowDebug) {
      globalThis.window?.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'StateEvents',
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

  callHandlers(data) {
    this.handlers.forEach((handler) => {
      try {
        handler.callback(data);
      } catch (err) {
        if (handler.onError) {
          handler.onError(err);
        } else {
          throw err;
        }
      }
    });
  }
}
