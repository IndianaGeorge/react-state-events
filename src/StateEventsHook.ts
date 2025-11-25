import type { IStateEvents, IErrorCallback } from './types/StateEvents';

import { useState, useEffect } from 'react';

const useStateEvents = <T>(stateEvents: IStateEvents<T>, onError: IErrorCallback | null = null): [T, (state: T) => void] => {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data: T) => setValue(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler = onError ? (err: any) => onError(err) : undefined;
    stateEvents.subscribe(callback, errorHandler);
    return () => stateEvents.unsubscribe(callback);
  }, [stateEvents, onError]);
  const newSetValue = (state: T) => stateEvents.publish(state);
  return [value, newSetValue];
}

export default useStateEvents;
