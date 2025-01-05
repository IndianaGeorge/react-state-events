import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react';
import { ExternalStateEvents } from './index';

vi.useFakeTimers();

describe('ExternalStateEvents', () => {
  beforeEach(() => {
    window.origin = 'test';
    window.postMessage = vi.fn();
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register the handler when subscribe is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler = vi.fn();
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
    vi.runAllTimers();

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('should send a message when publish is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');

    act(() => {
      stateEvents.publish(42);
    });
    vi.runAllTimers();

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        name: 'example',
        payload: 42,
        success: true,
        type: 'react-state-event'
      },
      'test'
    );
  });

  it('should call the error handler when message says no success', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const errorHandler = vi.fn();
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
    vi.runAllTimers();

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  it('should call error handler when message handler throws', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const error = new Error('An error occurred');
    const handler = vi.fn().mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw error;
    });
    const errorHandler = vi.fn();
    stateEvents.subscribe(handler, errorHandler);

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
    vi.runAllTimers();

    expect(errorHandler).toHaveBeenCalledWith(error);
  });

  it('should throw error when message handler throws and no error handler', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler = vi.fn().mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'An error occurred';
    });
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

    const t = () => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    };

    expect(t).toThrow('An error occurred');
  });

  it('should throw when message says no success and no error handler', async () => {
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
    vi.runAllTimers();

    expect(t).toThrow('An error occurred');
  });

  it('should send a message with error when error is called', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const errorHandler = vi.fn();
    stateEvents.subscribe(undefined, errorHandler);

    act(() => {
      stateEvents.error('An error ocurred');
    });
    vi.runAllTimers();

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

  it('should unsubscribe a callback', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler1 = vi.fn();
    const handler2 = vi.fn();
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

    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    stateEvents.unsubscribe(handler1);
    expect(window.removeEventListener).not.toHaveBeenCalled();
    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    vi.runAllTimers();

    expect(handler1).toHaveBeenCalledWith(42);
  });

  it('should unsubscribe all callbacks', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);
    stateEvents.unsubscribeAll();
    stateEvents.publish(42);

    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(1);
    expect(handler1).not.toHaveBeenCalledWith(42);
    expect(handler2).not.toHaveBeenCalledWith(42);
  });

  it('should request and use initialization value', async () => {
    const stateEvents = new ExternalStateEvents(0, 'example');
    const handler = vi.fn();
    stateEvents.subscribe(handler);

    expect(window.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'react-state-event-initrequest',
        name: 'example',
        timing: expect.any(Number)
      }),
      'test'
    );

    const mockMessageEvent = {
      origin: window.origin,
      source: window,
      data: {
        type: 'react-state-event-initresponse',
        name: 'example',
        success: true,
        payload: 42
      }
    };

    act(() => {
      window.addEventListener.mock.calls[0][1](mockMessageEvent);
    });
    vi.runAllTimers();

    const isInitialized = stateEvents.isInitialized();
    const current = stateEvents.getCurrent();

    expect(isInitialized).toBeTruthy();
    expect(current).toBe(42);
  });
});
