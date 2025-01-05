import { describe, expect, it, vi } from 'vitest'

import { renderHook } from '@testing-library/react';
import { act } from '@testing-library/react';
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
    const errHandler = vi.fn();
    renderHook(() => useStateEvents(stateEvents, errHandler));

    act(() => {
      stateEvents.error('An error occurred');
    });

    expect(errHandler).toHaveBeenCalledWith('An error occurred');
  });
});
