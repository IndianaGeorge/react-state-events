import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';

export default function useStateEvents<T>(stateEvents: IStateEvents<T>, onError: IErrorCallback | null = null) {
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
  const newSetValue = (state: T) => stateEvents.publish(state);
  return [value, newSetValue];
}

useStateEvents.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func
};
