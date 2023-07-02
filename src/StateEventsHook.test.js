import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';
import StateEvents from './StateEvents';
import { useStateEvents } from './index';

describe('useStateEvents', () => {
  test('should return the initial value and update when stateEvents publishes', async () => {
    const stateEvents = new StateEvents(0);
    const { result } = renderHook(() => useStateEvents(stateEvents));
    expect(result.current[0]).toBe(0);
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
  });

  test('should handle errors when onError is provided', async () => {
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
