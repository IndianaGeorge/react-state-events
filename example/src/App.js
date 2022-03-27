import React from 'react';
import { StateEvents, ExternalStateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';

export default (props) => {
  const counterEvents = new StateEvents(0);
  const extCounterEvents = new ExternalStateEvents(0,"counter");
  return (
    <div>
      <div>
        Counter via useSubject hook: <FromHook stateEvents={counterEvents} />
      </div>
      <div>
        Counter via Subscription component: <FromComponent stateEvents={counterEvents} />
      </div>
      <div>
        Counter via useSubject hook (External): <FromHook stateEvents={extCounterEvents} />
      </div>
      <div>
        Counter via Subscription component (External): <FromComponent stateEvents={extCounterEvents} />
      </div>
    </div>
  )
}
