import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export class StateEvents {
  handlers = [];
  subscribe(callback, onError){
    this.handlers.push({callback, onError});
  }

  unsubscribe(callback){
    this.handlers = this.handlers.filter((handler)=>handler.callback != callback);
  }

  unsubscribeAll(){
    this.handlers=[];
  }

  publish(data){
    this.handlers.forEach(handler=>{
      try {
        handler.callback(data);
      }
      catch(err) {
        if (handler.onError) {
          handler.onError(err);
        }
        else {
          throw(err);
        }
      }
    });
  }

  error(err){
    this.handlers.forEach(handler=>{
      if (handler.onError) {
        handler.onError(err);
      }
      else {
        throw(err);
      }
    });
  }
} 

export const useStateEvents = (initial,stateEvents,onError) => {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const callback = data => setValue(data);
    if (onError) {
      const errorHandler = err => onError(err);
      stateEvents.subscribe(callback,errorHandler);
    }
    else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  },[]);
  const newSetValue = state => stateEvents.publish(state);
  return [value, newSetValue];
};

useStateEvents.propTypes = {
  initial: PropTypes.any.isRequired,
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func,
}

export const Subscription = ({initial,stateEvents,children,onError}) => {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const callback = data => setValue(data);
    if (onError) {
      const errorHandler = err => onError(err);
      stateEvents.subscribe(callback,errorHandler);
    }
    else {
      stateEvents.subscribe(callback);
    }
    return () => stateEvents.unsubscribe(callback);
  },[]);
  return children(value);
}

Subscription.propTypes = {
  initial: PropTypes.any.isRequired,
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func,
}
