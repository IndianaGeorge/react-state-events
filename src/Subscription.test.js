import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';
import { StateEvents, Subscription } from './index';

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
