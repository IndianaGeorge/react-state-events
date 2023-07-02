const initTimeoutMiliseconds = 500;

export default class ExternalStateEvents {
  constructor(initial, name) {
    this.current = initial;
    this.name = name;
    this.initTimer = setTimeout(() => {
      this.initialize();
    }, initTimeoutMiliseconds);
    setTimeout(function () {
      window.postMessage(
        { type: 'react-state-event-initrequest', name: name },
        window.origin
      );
    }, 1000);
  }

  handlers = [];
  subscribe(callback, onError) {
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
            this.initialize();
          }
          break;
        case 'react-state-event':
          this.initialize();
          break;
        case 'react-state-event-initrequest':
          if (this.isInitialized()) {
            window.postMessage(
              {
                type: 'react-state-event-initresponse',
                name: this.name,
                success: true,
                payload: this.current
              },
              window.origin
            );
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
    this.handlers.push({
      callback,
      wrappedCallback: boundWrappedCallback,
      onError
    });
    window.addEventListener('message', boundWrappedCallback, true);
  }

  isInitialized() {
    return this.initTimer === null;
  }

  initialize() {
    if (this.initTimer != null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
    }
  }

  unsubscribe(callback) {
    const handler = this.handlers.find(
      (handler) => handler.callback === callback
    );
    this.handlers = this.handlers.filter(
      (handler) => handler.callback !== callback
    );
    if (handler) {
      const { wrappedCallback } = handler;
      window.removeEventListener('message', wrappedCallback, true);
    }
  }

  unsubscribeAll() {
    this.handlers.forEach((handler) =>
      window.removeEventListener('message', handler.wrappedCallback, true)
    );
    this.handlers = [];
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
