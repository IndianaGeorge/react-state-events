import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';

type subscriptionParameterType<T> = {
  stateEvents: IStateEvents<T>;
  children: Function;
  onError: IErrorCallback;
}

export default function Subscription<T>({ stateEvents, children, onError }: subscriptionParameterType<T>) {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data: T) => setValue(data);
    if (onError) {
      const errorHandler = (err: Error) => onError(err);
      stateEvents.subscribe(callback, errorHandler);
    } else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  }, []);
  return typeof children === 'function' ? children(value) : null;
}

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};
