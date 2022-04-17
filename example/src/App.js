import React from 'react';
import { StateEvents, ExternalStateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';

export default (props) => {
  const counterEvents = new StateEvents(0,"single counter");
  const extCounterEventsA = new ExternalStateEvents(0,"counter");
  const extCounterEventsB = new ExternalStateEvents(0,"counter");
  return (
    <div>
      <div>
        Counter via useStateEvents hook: <FromHook stateEvents={counterEvents} />
      </div>
      <div>
        Counter via Subscription class: <FromComponent stateEvents={counterEvents} />
      </div>
      <div>
        Counter via useSubject hook (External): <FromHook stateEvents={extCounterEventsA} />
      </div>
      <div>
        Counter via Subscription component (External): <FromComponent stateEvents={extCounterEventsB} />
      </div>
    </div>
  )
}
