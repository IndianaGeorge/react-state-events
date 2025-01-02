import { describe, expect, it, vi } from 'vitest'

import { renderHook } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import act from 'react-dom/test-utils';
import LocalStateEvents from './LocalStateEvents';
import { useStateEvents } from './index';

describe('useStateEvents', () => {
  it('should return the initial value and update when stateEvents publishes', async () => {
    const stateEvents = new LocalStateEvents(0);
    const { result } = renderHook(() => useStateEvents(stateEvents));
    expect(result.current[0]).toBe(0);
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
  });

  it('should handle errors when onError is provided', async () => {
    const stateEvents = new LocalStateEvents(0);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation();
    renderHook(() => useStateEvents(stateEvents, console.error));

    act(() => {
      stateEvents.error('An error occurred');
    });

    expect(errorSpy).toHaveBeenCalledWith('An error occurred');
    errorSpy.mockRestore();
  });
});
