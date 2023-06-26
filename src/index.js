import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const initTimeoutMiliseconds = 500;

let streamCounter = 0;

export class StateEvents {
  constructor(initial, debugName) {
    this.current = initial;
    const finalDebugName = debugName || 'Anonymous';
    const streamId = String(++streamCounter);
    this.streamId = streamId;
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.REACT_STATE_EVENT_DEVTOOL === 'true'
    ) {
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
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.REACT_STATE_EVENT_DEVTOOL === 'true'
    ) {
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
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.REACT_STATE_EVENT_DEVTOOL === 'true'
    ) {
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
        }
      }
    };
    this.handlers.push({ callback, wrappedCallback, onError });
    window.addEventListener('message', wrappedCallback, true);
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
  return typeof children === 'function' ? children(value) : null;
};

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};
