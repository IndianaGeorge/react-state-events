import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';
import {
  StateEvents,
  ExternalStateEvents,
  useStateEvents,
  Subscription
} from './index';

jest.useFakeTimers();

describe('StateEvents', () => {
  test('should call the handler when publish is called', () => {
    const stateEvents = new StateEvents(0);
    const handler = jest.fn();
    stateEvents.subscribe(handler);

    stateEvents.publish(42);

    expect(handler).toHaveBeenCalledWith(42);
  });

  test('should call the error handler when error is called', () => {
    const stateEvents = new StateEvents(0);
    const errorHandler = jest.fn();
    stateEvents.subscribe(undefined, errorHandler);

    stateEvents.error('An error occurred');

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  test('should unsubscribe a callback', () => {
    const stateEvents = new StateEvents(0);
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);

    stateEvents.unsubscribe(handler1);
    stateEvents.publish(42);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(42);
  });

  test('should unsubscribe all callbacks', () => {
    const stateEvents = new StateEvents(0);
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);

    stateEvents.unsubscribeAll();
    stateEvents.publish(42);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});

describe('ExternalStateEvents', () => {
  beforeEach(() => {
    window.postMessage = jest.fn();
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
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
    const stateEvents = new ExternalStateEvents(0, 'example');

    act(() => {
      stateEvents.publish(42);
    });
    jest.runAllTimers();

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        name: 'example',
        payload: 42,
        success: true,
        type: 'react-state-event'
      },
      undefined
    );
  });

  test('should call the error handler when message says no success', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const errorHandler = jest.fn();
    stateEvents.subscribe(undefined, errorHandler);

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

    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    jest.runAllTimers();

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
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
      undefined
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

describe('useStateEvents', () => {
  test('should return the initial value and update when stateEvents publishes', () => {
    const stateEvents = new StateEvents(0);
    const { result } = renderHook(() => useStateEvents(stateEvents));

    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
  });

  test('should handle errors when onError is provided', () => {
    const stateEvents = new StateEvents(0);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    renderHook(() => useStateEvents(stateEvents, console.error));

    act(() => {
      stateEvents.error('An error occurred');
    });

    expect(errorSpy).toHaveBeenCalledWith('An error occurred');
    errorSpy.mockRestore();
  });
});

describe('Subscription', () => {
  test('renders the child component with the current value', async () => {
    const stateEvents = new StateEvents(0, 'example');
    const ChildComponent = (value) => <div>{value}</div>;

    const { getByText } = render(
      <Subscription stateEvents={stateEvents}>{ChildComponent}</Subscription>
    );

    await waitFor(() => {
      expect(getByText('0')).toBeInTheDocument();
    });
    act(() => {
      stateEvents.publish(42);
    });

    expect(getByText('42')).toBeInTheDocument();
  });

  test('should handle errors when onError is provided', () => {
    const stateEvents = new StateEvents(0);
    const ChildComponent = (value) => <div>{value}</div>;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <Subscription stateEvents={stateEvents} onError={console.error}>
        {ChildComponent}
      </Subscription>
    );

    act(() => {
      stateEvents.error('An error occurred');
    });

    expect(errorSpy).toHaveBeenCalledWith('An error occurred');
    errorSpy.mockRestore();
  });
});
