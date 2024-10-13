import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function useStateEvents(stateEvents, onError) {
  console.log('react-state-events useStateEvents hook before useState', useState);
  const [value, setValue] = useState(stateEvents.getCurrent());
  console.log('react-state-events useStateEvents hook before useEffet');
  useEffect(() => {
    console.log('react-state-events useStateEvents hook inside useEffet');
    const callback = (data) => setValue(data);
    if (onError) {
      const errorHandler = (err) => onError(err);
      stateEvents.subscribe(callback, errorHandler);
    } else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  }, []);
  console.log('react-state-events useStateEvents hook after useEffet');
  const newSetValue = (state) => stateEvents.publish(state);
  return [value, newSetValue];
}

useStateEvents.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func
};
