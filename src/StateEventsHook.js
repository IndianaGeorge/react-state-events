import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function useStateEvents(stateEvents, onError) {
  const [value, setValue] = useState(stateEvents.getCurrent());
  useEffect(() => {
    const callback = (data) => setValue(data);
    if (onError) {
      const errorHandler = (err) => onError(err);
      stateEvents.subscribe(callback, errorHandler);
    } else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  }, []);
  const newSetValue = (state) => stateEvents.publish(state);
  return [value, newSetValue];
}

useStateEvents.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func
};
