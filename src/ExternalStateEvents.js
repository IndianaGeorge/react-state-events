const initTimeoutMiliseconds = 500;

export default class ExternalStateEvents {
  constructor(initial, name) {
    this.current = initial;
    this.name = name;
    this.initTimer = null;
    this.timestamp = null;
    this.callbacks = [];
    this.handler = null;
    this.nape = name;
  }

  subscribe(callback, onError) {
    this.callbacks.push({ callback, onError });
    if (this.callbacks.length === 1) {
      const wrappedCallback = (event) => {
        if (
          event.origin !== window.origin ||
          event.source !== window ||
          event.data.name !== this.name
        ) {
          return;
        }
        switch (event.data.type) {
          case 'react-state-event-initresponse':
            if (event.data.success) {
              if (this.isInitialized()) {
                return;
              }
              this.current = event.data.payload;
              this.initialize();
            }
            break;
          case 'react-state-event':
            this.initialize();
            break;
          case 'react-state-event-initrequest':
            if (this.isInitialized()) {
              if (this.timestamp < event.data.timing) {
                // we initialized before request, so respond
                window.postMessage(
                  {
                    type: 'react-state-event-initresponse',
                    name: this.name,
                    success: true,
                    payload: this.current,
                    timing: this.timing
                  },
                  window.origin
                );
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
            if (onError) {
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
      this.handler = {
        callback,
        wrappedCallback: boundWrappedCallback,
        onError
      };
      window.addEventListener('message', boundWrappedCallback, true);
      window.postMessage(
        {
          type: 'react-state-event-initrequest',
          name: this.name,
          timing: Date.now()
        },
        window.origin
      );
      this.initTimer = setTimeout(() => {
        this.initialize();
      }, initTimeoutMiliseconds);
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

  unsubscribe(callback) {
    const handler = this.callbacks.find(
      (handler) => handler.callback === callback
    );
    if (handler) {
      this.callbacks = this.callbacks.filter(
        (handler) => handler.callback !== callback
      );
      if (this.callbacks.length === 0) {
        const { wrappedCallback } = this.handler;
        window.removeEventListener('message', wrappedCallback, true);
        this.handler = null;
        this.uninitialize();
      }
    }
  }

  unsubscribeAll() {
    if (this.handler) {
      const { wrappedCallback } = this.handler;
      window.removeEventListener('message', wrappedCallback, true);
      this.callbacks = [];
      this.handler = null;
      this.uninitialize();
    }
  }

  getCurrent() {
    return this.current;
  }

  publish(data) {
    this.current = data;
    window.postMessage(
      {
        type: 'react-state-event',
        name: this.name,
        success: true,
        payload: data
      },
      window.origin
    );
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.REACT_STATE_EVENT_DEVTOOL === 'true'
    ) {
      window.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'ExternalStateEvents',
            streamId: this.name,
            success: true,
            value: data
          }
        },
        '*'
      );
    }
  }

  error(err) {
    window.postMessage(
      {
        type: 'react-state-event',
        name: this.name,
        success: false,
        payload: err
      },
      window.origin
    );
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.REACT_STATE_EVENT_DEVTOOL === 'true'
    ) {
      window.postMessage(
        {
          type: 'react-state-event-devTool-notify',
          payload: {
            streamType: 'ExternalStateEvents',
            streamId: this.name,
            success: true,
            value: err
          }
        },
        '*'
      );
    }
  }
}
