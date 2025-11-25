# react-state-events

> Lift React state via events

[See a working demo](https://indianageorge.github.io/react-state-events/)

[![NPM](https://img.shields.io/npm/v/react-state-events.svg)](https://www.npmjs.com/package/react-state-events)

## Install

```bash
npm install --save react-state-events
```

> It's recommended to also install the [react-state-event devtool](https://chromewebstore.google.com/detail/react-state-event-devtool/abiphondclhikplkmjmnnaoaldmeocoo) Chrome extension.

## What is this?
This is a collection of tools to help you lift React state.
- LocalStateEvents: a class to publish and subscribe to.
- MessageStateEvents: same as above, but communicates through a name without having the original instance (useful for micro-frontends).
- useStateEvents: a React hook to publish data and update your component when data arrives.
- Subscription: a React component that will update when data arrives.

## How is it useful?
- It allows you to decouple data handling from React components, in a pattern similar to MVC.
- It lets you put all the data handling code in a single class, so it's easier to test and maintain.
- It lets your React components be solely about user interface, so they're simpler to read
- It lets you handle state in a modular way, so you may bring code to another project untouched, without having to worry about how it fits into the global state or component hierarchy.
- It lets you control instances yourself, so you could have more than one and choose which instance gets passed to which component, without modifying the code that handles the data.
- It does the above using very little code.
- There is a companion extension to debug your event streams in development builds.

## Using the LocalStateEvents class
**Advantages**
- Can be subscribed/published to
- Can get the current value through `getCurrent`
- Can handle exceptions in the callback
- High performance
- Multiple instances do not clash
- Optional name for debugging, shows on React DevTools in suscriber hooks as LocalStateEvents
```js
import { LocalStateEvents } from 'react-state-events'

const events = new LocalStateEvents(0);
events.subscribe((data)=>console.log(data));
events.publish(1);
events.publish(2);
events.unsubscribeAll();
```

### Caveats
* In development mode, React renders everything twice. This means your LocalStateEvent will probably get instanced twice and announce itself twice to the debug extension, so you will see two identical streams and only one will work. This will not happen in production builds.
* If you create more streams with the same debug name, they will be separate in the debug extension, but will show the same name.

## Using the MessageStateEvents class
**Advantages**
- Can be subscribed/published to
- Can handle exceptions in the callback
- Can get the current value through `getCurrent`
- __Can cross micro-frontend boundaries__
- Can subscribe/publish by a name, without knowing about other instances
- May pass an Array of Targets (see below) to share state with other windows
```js
import { MessageStateEvents } from 'react-state-events'

const events = new MessageStateEvents(0, 'myStreamName');
events.subscribe((data)=>console.log(data));
events.publish(1);
events.publish(2);
events.unsubscribeAll();
```

### Communicating with another window

`MessageStateEvents` communicates with other windows through relaying events.

We describe windows to communicate with as Targets, with the following TypeScript type:

```ts
type Target = {
  source: Window;
  origin: string;
}
```

Communication across windows has **many** caveats, because of security measures implemented by browsers:
* origin must NOT be '*', use window.origin to get a window's origin.
* origin must be the same on all connected windows
* you'll need a reference to the target window, which you'll only have with popups

We can see this in action in the provided example project. Here's the relevant details:

Host opening a popup and connecting to it, at any time:
```js
const popup = window.open(window.URL, '_blank', 'popup');
hostMessageEventStreamInstance.addTarget(popup, window.origin);
```
**IMPORTANT**
* make sure to connect streams only **ONCE** to each window!
* Since `MessageStateEvents` connect by name, if you have multiple instances connecting from different parts of your application, only one of them should have the target (and thus, relaying events).
* The instance that has the target does the communication. If this instance is unsubscribed, it will no longer relay messages to the other window.
* For this reason, you might want to have a dedicated instance whose sole role is to relay to known popups.

Popup connecting to the host, so the popup relays it's events back to the host:

```js
const popupMessageEventStreamInstance =
  new MessageStateEvents(0,"counter", window.opener ? {targets: [{source: window.opener, origin: window.opener.origin}]}: {}, true);
```

### Daisy-chaining popups

* YES! you may daisy-chain popups so they all communicate
* If one of the windows in the daisy chain is closed, it won't relay communications between parent and children anymore, so states will diverge

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

## Typescript

Template types are to be used with your own event types.
```tsx
export LocalCounterEventStreamType = LocalStateEvents<number>;
export MessageCounterEventStreamType = MessageStateEvents<number>;
```

Then use the declared type for consistency across your application
```tsx
const counterStream : LocalCounterEventStreamType = new LocalStateEvents(0);
```

## How do I lift state using react-state-events?

Using a combination of react-state-events and the Context API:
* Create a controller class (not a React component!) that keeps state and a `LocalStateEvents` instance. Take the debugName in the constructor.
* Implement a method in the controller that returns the `LocalStateEvents` instance, so components can subscribe to it. Have more instances if they need to update independently.
* Implement methods in the controller that change the state and publish it
* Create a context object to hold the instance (or instances!) of the controller. Pass the debugName for this instance to the constructor.
* In your components, get the controller instance from the context and use the hook or class to handle the subscription and notify the component of updates.

**CounterController.js**
```js
import { LocalStateEvents } from 'react-state-events'

export default class CounterController {
    constructor(debugName) {
        this.counterEvents = new LocalStateEvents(0,debugName);
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
You don't need the context API, just use `MessageStateEvents` in place of `LocalStateEvents` and remember the event stream name parameter. External event streams are global, so it identifies the stream across ALL your application, ACROSS micro-frontends.
* Create one `MessageStateEvents` in micro-frontend `A`, use the `useStateEvents` hook with it.
* Create one `MessageStateEvents` in micro-frontend `B` with the same name you used in `A` and use the `useStateEvents` with it.
* Make sure the `MessageStateEvents` object is not being destroyed with every render! This causes multiple problems. Context API works here (as shown above), but passing an instance as a prop to the controlled component is also enough. You may also use the useMemo hook.
* If you change the state in `A`, `B` will update with the value (and vice-versa).
* `A` and `B` can be host/application or siblings, they will still communicate.
* This is achieved using asynchronous messages, so performance is lower than `LocalStateEvents`.
* You can relay events to popups and even daisy-chain them to share state across many windows.

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
* The constructor was passed the allowDebug parameter as true
    * `const es = new LocalStateEvents(0, 'myStreamName', true);`
    * `const es = new MessageStateEvents(0, 'myStreamName', {}, true);`
* It's a development build (`process.env.NODE_ENV` exists and it's not `production`)
* Environment variable `process.env.REACT_STATE_EVENT_DEVTOOL` exists as `true`
* Environment variable `process.env.REACT_APP_REACT_STATE_EVENT_DEVTOOL` exists as `true`

## Is lifting state using `MessageStateEvents` safer than using `localStorage`?
* Messages are scoped to the window that emitted them.
* Any Javascript running in the same window will see the passing messages, so it's vulnerable to XSS just like `localStorage`.
* Messages are __NOT__ stored (as in `localStorage`), so once the event is handled, an XSS attack cannot retrieve it anymore.
* Messages can be sent to and received from the window through the javascript console

## License

MIT © [IndianaGeorge](https://github.com/IndianaGeorge)
