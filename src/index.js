import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export class StateEvents {
  constructor(initial) {
    this.current = initial;
  }

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

  getCurrent(){
    return this.current;
  }

  publish(data){
    this.current = data;
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

export class ExternalStateEvents {
  constructor(initial, name) {
    this.current = initial;
    this.name = name;
  }

  handlers = [];
  subscribe(callback, onError){
    this.handlers.push({callback, onError});
    window.addEventListener("message", (event) => {
      if (event.origin !== window.origin
        || event.source !== window
        || event.data.type != "react-state-event"
        || event.data.name != this.name
      ) {
          return;
      }
      if (event.data.success) {
        try {
          callback(event.data.payload);
        }
        catch(err) {
          if (onError) {
            onError(err);
          }
          else {
            throw(err);
          }
        }  
      } else {
        if (onError) {
          onError(event.data.payload);
        }
      }
    }, true);
  }

  unsubscribe(callback){
    this.handlers = this.handlers.filter((handler)=>handler.callback != callback);
    window.removeEventListener("message", callback, true);
  }

  unsubscribeAll(){
    this.handlers.forEach((item) => window.removeEventListener("message", item.callback, true));
    this.handlers=[];
  }

  getCurrent(){
    return this.current;
  }

  publish(data){
    this.current = data;
    window.postMessage({type: "react-state-event", name: this.name, success: true, payload: data});
  }

  error(err){
    window.postMessage({type: "react-state-event", name: this.name, success: false, payload: err}, window.origin);
  }
}

export const useStateEvents = (stateEvents,onError) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
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
  stateEvents: PropTypes.object.isRequired,
  onError: PropTypes.func,
}

export const Subscription = ({stateEvents,children,onError}) => {
  const [value, setValue] = useState(stateEvents.getCurrent());
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
  stateEvents: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onError: PropTypes.func,
}
