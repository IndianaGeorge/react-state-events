import '@testing-library/jest-dom/extend-expect';
import { LocalStateEvents } from './index';

describe('LocalStateEvents', () => {
  test('should call the handler when publish is called', () => {
    const stateEvents = new LocalStateEvents(0);
    const handler = jest.fn();
    stateEvents.subscribe(handler);

    stateEvents.publish(42);

    expect(handler).toHaveBeenCalledWith(42);
  });

  test('should call the error handler when error is called', () => {
    const stateEvents = new LocalStateEvents(0);
    const errorHandler = jest.fn();
    stateEvents.subscribe(undefined, errorHandler);

    stateEvents.error('An error occurred');

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });

  test('should throw when error is called with no error handler', () => {
    const stateEvents = new LocalStateEvents(0);
    stateEvents.subscribe(undefined);

    const t = () => {
      stateEvents.error('An error occurred');
    };
    expect(t).toThrow('An error occurred');
  });

  test('should unsubscribe a callback', () => {
    const stateEvents = new LocalStateEvents(0);
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
    const stateEvents = new LocalStateEvents(0);
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
