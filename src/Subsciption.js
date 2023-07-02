import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Subscription({ stateEvents, children, onError }) {
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
  return typeof children === 'function' ? children(value) : null;
}

Subscription.propTypes = {
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func
};
