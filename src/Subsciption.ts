import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';

type subscriptionParameterType<T> = {
  stateEvents: IStateEvents<T>;
  children: Function;
  onError?: IErrorCallback;
}

const Subscription = <T>({ stateEvents, children, onError }: subscriptionParameterType<T>) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data: T) => setValue(data);
    const errorHandler = onError ? (err: Error) => onError(err) : undefined;
    stateEvents.subscribe(callback, errorHandler);
    return () => stateEvents.unsubscribe(callback);
  }, []);
  return typeof children === 'function' ? children(value) : null;
}

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};

export default Subscription;
