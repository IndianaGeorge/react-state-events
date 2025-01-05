import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { LocalStateEvents } from './index';

describe('LocalStateEvents', () => {
  it('should call the handler when publish is called', () => {
    const stateEvents = new LocalStateEvents(0);
    const handler = vi.fn();
    stateEvents.subscribe(handler);

    stateEvents.publish(42);

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('should call the error handler when error is called', () => {
    const stateEvents = new LocalStateEvents(0);
    const errorHandler = vi.fn();
    stateEvents.subscribe(undefined, errorHandler);

    stateEvents.error('An error occurred');

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  it('should throw when error is called with no error handler', () => {
    const stateEvents = new LocalStateEvents(0);
    stateEvents.subscribe(undefined);

    const t = () => {
      stateEvents.error('An error occurred');
    };
    expect(t).toThrow('An error occurred');
  });

  it('should unsubscribe a callback', () => {
    const stateEvents = new LocalStateEvents(0);
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);

    stateEvents.unsubscribe(handler1);
    stateEvents.publish(42);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(42);
  });

  it('should unsubscribe all callbacks', () => {
    const stateEvents = new LocalStateEvents(0);
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    stateEvents.subscribe(handler1);
    stateEvents.subscribe(handler2);

    stateEvents.unsubscribeAll();
    stateEvents.publish(42);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
