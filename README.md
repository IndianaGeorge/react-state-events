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
- StateEvents: a class to publish and subscribe to.
- useStateEvents: a hook to publish data and update your component when data arrives.
- Subscription: a component that will update when data arrives.

## How is it useful?
- It allows you to decouple data handling from react components, in a pattern similar to MVC.
- It lets you put all the data handling code in a single class, so it's easier to test and maintain.
- It lets your React components be solely about user interface, so they're simpler to read
- It lets you handle state in a modular way, so you may bring code to another project untouched, without having to worry about how it fits into the global state or component hierarchy.
- It lets you control instances yourself, so you could have more than one and choose which instance gets passed to which component, without modifying the code that handles the data.
- It does the above using very little code.

## Using the StateEvents class
**Uses**
- Can be subscribed/published to
- Can handle exceptions in the callback
```js
import { StateEvents } from 'react-state-events'

const events = new StateEvents();
events.subscribe((data)=>console.log(data));
events.publish(1);
events.publish(2);
events.unsubscribeAll();
```

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

## How do I lift state using react-state-event?

Using a combination of react-state-events and the Context API:
* Create a controller class (not a React component!) that keeps state and a `StateEvents` instance.
* Implement a method in the controller that returns the `StateEvents` instance, so components can subscribe to it. Have more instances if they need to update independently.
* Implement methods in the controller that change the state and publish it
* Create a context object to hold the instance (or instances!) of the controller.
* In your components, get the controller instance from the context and use the hook or class to handle the subscription and notify the component of updates.

**CounterController.js**
```js
import { StateEvents } from 'react-state-events'

export default class CounterController {
    constructor() {
        this.counterEvents = new StateEvents();
        this.counter = 0;
    }

    getCounterEvents() {
        return this.counterEvents;
    }

    increment() {
        this.counter++;
        this.counterEvents.publish(this.counter);
    }
}
```

**counterContext.js**
```js
import { createContext } from 'react';
import CounterController from '../Controller/CounterController';

const counterContext = createContext(new CounterController());

export { counterContext };
```

**counterView.js**
```jsx
import React, { useState, useContext } from 'react';
import { useStateEvents } from 'react-state-events';
import { counterContext } from '../Context/counterContext';

export default (props)=>{
  const counterController = useContext(counterContext);
  const [counter] = useStateEvents(0, Controller.getfilteredItemsEvents());
  const increment = ()=>counterController.increment();
  return (
    <div>
      <button onClick={increment}>{counter}</button>
    </div>
  )
}
```

When clicking the button
- The controller's increment method will increment the counter in the state and publish.
- The useStateEvents hook will get a notification of that subscription and trigger a render.
- All instances of the component will be redrawn with the new counter.

Try adding more instances of the counter in the context, or even in a new context!

## License

MIT © [IndianaGeorge](https://github.com/IndianaGeorge)
