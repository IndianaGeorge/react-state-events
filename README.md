# react-state-events

> Lift React state via events

[See a working demo](https://indianageorge.github.io/react-state-events/)

[![NPM](https://img.shields.io/npm/v/react-state-events.svg)](https://www.npmjs.com/package/react-state-events)

## Breaking changes from version 2.x
- Moved to React 18
- Different instances of StateEvents will no longer get mixed up in the debugger, which avoids confusion when you have more than one copy of the library in your bundle. This may result in an unused stream being shown in the debugger in development mode because React renders twice. To avoid this, you can use a context.
## Breaking changes from version 1.x
- StateEvents constructor now takes a value to initialize the class.
- useStateEvents hook and Subscription class no longer pass an initial value, they will now receive the initial value or the last published value of the StateEvents instance.
- This was made so the initial value is consistent across views.

## Install

```bash
npm install --save react-state-events
```

> It's recommended to also install the [react-state-event devtool](https://chromewebstore.google.com/detail/react-state-event-devtool/abiphondclhikplkmjmnnaoaldmeocoo) Chrome extension.

## What is this?
This is a collection of tools to help you lift React state.
- StateEvents: a class to publish and subscribe to.
- ExternalStateEvents: same as above, but communicates through a name without having the original instance (useful with micro-frontends).
- useStateEvents: a React hook to publish data and update your component when data arrives.
- Subscription: a component that will update when data arrives.

## How is it useful?
- It allows you to decouple data handling from React components, in a pattern similar to MVC.
- It lets you put all the data handling code in a single class, so it's easier to test and maintain.
- It lets your React components be solely about user interface, so they're simpler to read
- It lets you handle state in a modular way, so you may bring code to another project untouched, without having to worry about how it fits into the global state or component hierarchy.
- It lets you control instances yourself, so you could have more than one and choose which instance gets passed to which component, without modifying the code that handles the data.
- It does the above using very little code.
- There is a companion extension to debug your event streams in development builds.

## Using the StateEvents class
**Advantages**
- Can be subscribed/published to
- Can handle exceptions in the callback
- High performance
- Multiple instances do not clash
- Optional name for debugging, shows on React DevTools in suscriber hooks as StateEvents
```js
import { StateEvents } from 'react-state-events'

const events = new StateEvents(0);
events.subscribe((data)=>console.log(data));
events.publish(1);
events.publish(2);
events.unsubscribeAll();
```

## Using the ExternalStateEvents class
**Advantages**
- Can be subscribed/published to
- __Can cross micro-frontend boundaries__
- Instances with the same name share streams
```js
import { ExternalStateEvents } from 'react-state-events'

const events = new StateEvents(0, 'myStreamName');
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
    const [val,setVal] = useStateEvents(myEvents);
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
import {Subscription} from 'react-state-events'

export default ({myEvents})=>
        <Subscription stateEvents={myEvents}>
            {(data)=>
                <span>
                    {data}
                </span>
            }
        </Subscription>
```

## Handling callback errors
All methods allow for handling callback errors. If a handler throws an exception and a single suscriber has no error handling callback, processing **will rethrow the exception** at that point, so (while it's optional) it's recommended that you always register an error handler, like so:

### useStateEvents hook
```jsx
const [val,setVal] = useStateEvents(myEvents, errorCallback);
```

### Subscription component
```jsx
<Subscription stateEvents={myEvents} onError={errorCallback} >
  {...}
</Subscription>
```
In both cases, errorCallback should be a function that takes a single argument for the error.

## How do I lift state using react-state-events?

Using a combination of react-state-events and the Context API:
* Create a controller class (not a React component!) that keeps state and a `StateEvents` instance. Take the debugName in the constructor.
* Implement a method in the controller that returns the `StateEvents` instance, so components can subscribe to it. Have more instances if they need to update independently.
* Implement methods in the controller that change the state and publish it
* Create a context object to hold the instance (or instances!) of the controller. Pass the debugName for this instance to the constructor.
* In your components, get the controller instance from the context and use the hook or class to handle the subscription and notify the component of updates.

**CounterController.js**
```js
import { StateEvents } from 'react-state-events'

export default class CounterController {
    constructor(debugName) {
        this.counterEvents = new StateEvents(0,debugName);
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

const counterContext = createContext(new CounterController("myCounter"));

export { counterContext };
```

**counterView.js**
```jsx
import React, { useState, useContext } from 'react';
import { useStateEvents } from 'react-state-events';
import { counterContext } from '../Context/counterContext';

export default (props)=>{
  const counterController = useContext(counterContext);
  const [counter] = useStateEvents(Controller.getfilteredItemsEvents());
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

## How do I share state across micro-frontends using react-state-events?
You don't need the context API, just use `ExternalStateEvents` in place of `StateEvents` and remember the event stream name parameter. External event streams are global, so it identifies the stream across ALL your application, ACROSS micro-frontends.
* Create one `ExternalStateEvents` in micro-frontend `A`, use the `useStateEvents` hook with it.
* Create one `ExternalStateEvents` in micro-frontend `B` with the same name you used in `A` and use the `useStateEvents` with it.
* Make sure the ExternalStateEvents object is not being destroyed with every render! This causes multiple problems. Context API works here (as shown above), but passing an instance as a prop to the controlled component is also enough.
* If you change the state in `A`, `B` will update with the value (and vice-versa).
* `A` and `B` can be host/application or siblings, they will still communicate.
* This is achieved using asynchronous messages, so performance is lower than `StateEvents`.

## How do I share state with micro-frontends written in a different framework?
You can communicate with other frameworks by sending/handling messages in the proper format:
```
window.postMessage({
    type: "react-state-event",
    name: streamName,
    success: success,
    payload: data
}, window.origin);
```
Where:
* type is always "react-state-event".
* name is the global name of the stream.
* success is true for success, false for error (which triggers registered error handlers).
* payload is the state that will be sent in the event.

## How do I use the react-state-event devtool extension with my code?
The extension will be able to collect data from an application using the library when any of the following conditions is met:
* The constructor was passed a third parameter of true
    * const es = new StateEvents(0, 'myStreamName', true);
    * const es = new ExternalStateEvents(0, 'myStreamName', true);
* It's a development build (`process.env.NODE_ENV` exists and it's not `production`)
* Environment variable `process.env.REACT_STATE_EVENT_DEVTOOL` exists as `true`
* Environment variable `process.env.REACT_APP_REACT_STATE_EVENT_DEVTOOL` exists as `true`

## Is lifting state using `ExternalStateEvents` safer than using `LocalStorage`?
* Messages are scoped to the window that emitted them.
* Any Javascript running in the same window will see the passing messages, so it's vulnerable to XSS just like LocalStorage.
* Messages are __NOT__ stored (as in LocalStorage), so once the event is handled, an XSS attack cannot retrieve it anymore.
* Messages can be sent to and received from the window through the javascript console

## License

MIT © [IndianaGeorge](https://github.com/IndianaGeorge)
