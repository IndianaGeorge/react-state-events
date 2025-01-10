import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import * as React from 'react';

type subscriptionParameterType<T> = {
  stateEvents: IStateEvents<T>;
  children: (state: T) => React.ReactNode;
  onError?: IErrorCallback;
}

const Subscription = <T>({ stateEvents, children, onError }: subscriptionParameterType<T>) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data: T) => setValue(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler = onError ? (err: any) => onError(err) : undefined;
    stateEvents.subscribe(callback, errorHandler);
    return () => stateEvents.unsubscribe(callback);
  }, [stateEvents, onError]);
  return typeof children === 'function' ? children(value) : null;
}

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};

export default Subscription;
