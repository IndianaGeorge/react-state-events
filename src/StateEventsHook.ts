import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';

const useStateEvents = <T>(stateEvents: IStateEvents<T>, onError: IErrorCallback | null = null) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data: T) => setValue(data);
    const errorHandler = onError ? (err: Error) => onError(err) : undefined;
    stateEvents.subscribe(callback, errorHandler);
    return () => stateEvents.unsubscribe(callback);
  }, []);
  const newSetValue = (state: T) => stateEvents.publish(state);
  return [value, newSetValue];
}

useStateEvents.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func
};

export default useStateEvents;
