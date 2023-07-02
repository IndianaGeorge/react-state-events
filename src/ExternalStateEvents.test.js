import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';
import { ExternalStateEvents } from './index';

jest.useFakeTimers();

describe('ExternalStateEvents', () => {
  beforeEach(() => {
    window.origin = 'test';
    window.postMessage = jest.fn();
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register the handler when subscribe is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler = jest.fn();
    stateEvents.subscribe(handler);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example',
        success: true,
        payload: 42
      }
    };

    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    jest.runAllTimers();

    expect(handler).toHaveBeenCalledWith(42);
  });

  test('should send a message when publish is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'previous');

    act(() => {
      stateEvents.publish(42);
    });
    jest.runAllTimers();

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        name: 'previous',
        payload: 42,
        success: true,
        type: 'react-state-event'
      },
      'test'
    );
  });

  test('should call the error handler when message says no success', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example_only');
    const errorHandler = jest.fn();
    stateEvents.subscribe(undefined, errorHandler);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example_only',
        success: false,
        payload: 'An error occurred'
      }
    };

    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    jest.runAllTimers();

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  test('should call error handler when message handler throws', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example_only');
    const handler = jest.fn().mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'An error occurred';
    });
    const errorHandler = jest.fn();
    stateEvents.subscribe(handler, errorHandler);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example_only',
        success: true,
        payload: 42
      }
    };

    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    jest.runAllTimers();

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  test('should throw error when message handler throws and no error handler', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example_only');
    const handler = jest.fn().mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'An error occurred';
    });
    stateEvents.subscribe(handler);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example_only',
        success: true,
        payload: 42
      }
    };

    const t = () => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    };

    expect(t).toThrow('An error occurred');
  });

  test('should throw when message says no success and no error handler', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    stateEvents.subscribe(undefined);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example',
        success: false,
        payload: 'An error occurred'
      }
    };

    const wrappedCallback = window.addEventListener.mock.calls[0][1];
    const t = () => {
      wrappedCallback(mockMessageEvent);
    };
    jest.runAllTimers();

    expect(t).toThrow('An error occurred');
  });

  test('should send a message with error when error is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const errorHandler = jest.fn();
    stateEvents.subscribe(undefined, errorHandler);

    act(() => {
      stateEvents.error('An error ocurred');
    });
    jest.runAllTimers();

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        name: 'example',
        payload: 'An error ocurred',
        success: false,
        type: 'react-state-event'
      },
      'test'
    );
  });

  test('should unsubscribe a callback', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example',
        success: true,
        payload: 42
      }
    };

    act(() => {
      stateEvents.unsubscribe(handler1);
      window.addEventListener.mock.calls[1][1](mockMessageEvent);
    });
    jest.runAllTimers();

    // expect(handler1).not.toHaveBeenCalled();
    expect(window.addEventListener.mock.calls[0][1]).toBe(
      window.removeEventListener.mock.calls[0][1]
    );
    expect(handler2).toHaveBeenCalledWith(42);
  });

  test('should unsubscribe all callbacks', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);
    stateEvents.unsubscribeAll();

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event',
        name: 'example',
        success: true,
        payload: 42
      }
    };

    const addEventListenerCalls = window.addEventListener.mock.calls;
    addEventListenerCalls.forEach(([eventType, callback, useCapture]) => {
      callback(mockMessageEvent);
      expect(window.removeEventListener).toHaveBeenCalledWith(
        eventType,
        callback,
        useCapture
      );
    });

    expect(handler1).toHaveBeenCalledWith(42);
    expect(handler2).toHaveBeenCalledWith(42);
  });
});
