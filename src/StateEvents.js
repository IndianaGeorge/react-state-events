let streamCounter = 0;

export default class StateEvents {
  constructor(initial, debugName = false, allowDebug = false) {
    this.current = initial;
    const streamId = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    const finalDebugName = debugName || `${streamId}`;
    this.streamId = streamId;
    const boolAllowDebug = !!allowDebug;
    this.allowDebug = boolAllowDebug && typeof window !== 'undefined';
    if (this.allowDebug) {
      setTimeout(function () {
        window.postMessage(
          {
            type: 'react-state-event-devTool-streamId',
            payload: finalDebugName,
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
      window.postMessage(
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
      window.postMessage(
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
