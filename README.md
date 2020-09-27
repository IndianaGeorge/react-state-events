# react-state-events

> Lift React state via events

[See a working demo](https://indianageorge.github.io/react-state-events/)

[![NPM](https://img.shields.io/npm/v/react-state-events.svg)](https://www.npmjs.com/package/react-state-events)

## Install

```bash
npm install --save react-state-events
```

## What is this?
This is a collection of tools to help you lift React state.
- StateEvents: a class to publish and subscribe to
- useStateEvents: a hook to publish data and update your component when data arrives
- Subscription: a component that will update when data arrives

## Using the useStateEvents hook
**Advantages**
- you can subscribe to multiple state events
- you get a function to update the state events
- jsx is simpler
```jsx
import React, {useState} from 'react'
import {useStateEvents} from 'react-state-events'

export default ({myEvents})=>{
    const [val,setVal] = useStateEvents("waiting for data",myEvents);
    return (
        <span>
            {val}
        </span>
    );
}
```

## Using the Subscription component
**Advantages**
- you can use it from a class component
```jsx
import React, {useState, useEffect} from 'react'
import {Subscription} from 'react-rxjs-tools'

export default ({myEvents})=>
        <Subscription initial="waiting for data" stateEvents={myEvents}>
            {(data)=>
                <span>
                    {data}
                </span>
            }
        </Subscription>
```

## Handling callback errors
All methods allow for handling callback errors. If a handler throws an exception and a single suscriber has no error handling callback, processing **will rethrow the exception** at that point, so (while it's optional) it's recommended that you always register an error handler, like so:

### useBehaviorSubject hook
```jsx
const [val,setVal] = useStateEvents(initial, myEvents, errorCallback);
```

### BehaviorSubscription component
```jsx
<Subscription initial={initial} stateEvents={myEvents} onError={errorCallback} >
  {...}
</Subscription>
```
In both cases, errorCallback should be a function that takes a single argument for the error.

## License

MIT © [IndianaGeorge](https://github.com/IndianaGeorge)
