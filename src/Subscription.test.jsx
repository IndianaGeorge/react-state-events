import { describe, expect, it, vi } from 'vitest'

import React from 'react';
import { render, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import { act } from '@testing-library/react';
import { LocalStateEvents, Subscription } from './index';

describe('Subscription', () => {
  it('should render the child component with the current value', async () => {
    const stateEvents = new LocalStateEvents(0, 'example');
    const ChildComponent = (value) => <div>{value}</div>;

    const { getByText } = render(
      <Subscription stateEvents={stateEvents}>{ChildComponent}</Subscription>
    );

    await waitFor(() => {
      expect(getByText('0')).toBeDefined();
    });
    act(() => {
      stateEvents.publish(42);
    });

    expect(getByText('42')).toBeDefined();
  });

  it('should handle errors when onError is provided', () => {
    const stateEvents = new LocalStateEvents(0);
    const ChildComponent = (value) => <div>{value}</div>;
    const errorHandler = vi.fn();

    render(
      <Subscription stateEvents={stateEvents} onError={errorHandler}>
        {ChildComponent}
      </Subscription>
    );

    act(() => {
      stateEvents.error('An error occurred');
    });

    expect(errorHandler).toHaveBeenCalledWith('An error occurred');
  });
});
