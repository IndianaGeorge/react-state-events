import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const initTimeoutMiliseconds = 500;

let streamCounter = 0;

export class StateEvents {
  constructor(initial, debugName) {
    this.current = initial;
    const finalDebugName = debugName || 'Anonymous';
    console.log(JSON.stringify(process.env.NODE_ENV));
    const streamId = String(++streamCounter);
    this.streamId = streamId;
    setTimeout(function () {
      window.postMessage(
        {
          type: 'react-state-event-devTool-streamId',
          payload: finalDebugName,
          id: streamId
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
    window.postMessage(
      {
        type: 'react-state-event-devTool-notify',
        payload: data,
        id: this.streamId
      },
      '*'
    );
    this.callHandlers(data);
  }

  error(err) {
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

export class ExternalStateEvents {
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
    this.handlers.push({ callback, onError });
    window.addEventListener(
      'message',
      (event) => {
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
          }
        }
      },
      true
    );
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
    this.handlers = this.handlers.filter(
      (handler) => handler.callback !== callback
    );
    window.removeEventListener('message', callback, true);
  }

  unsubscribeAll() {
    this.handlers.forEach((item) =>
      window.removeEventListener('message', item.callback, true)
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
  }
}

export const useStateEvents = (stateEvents, onError) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data) => setValue(data);
    if (onError) {
      const errorHandler = (err) => onError(err);
      stateEvents.subscribe(callback, errorHandler);
    } else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  }, []);
  const newSetValue = (state) => stateEvents.publish(state);
  return [value, newSetValue];
};

useStateEvents.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func
};

export const Subscription = ({ stateEvents, children, onError }) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data) => setValue(data);
    if (onError) {
      const errorHandler = (err) => onError(err);
      stateEvents.subscribe(callback, errorHandler);
    } else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  }, []);
  return children(value);
};

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};
