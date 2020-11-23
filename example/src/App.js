import React from 'react';
import { StateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';

export default (props) => {
  const counterEvents = new StateEvents(0);
  return (
    <div>
      <div>
        Counter via useSubject hook: <FromHook stateEvents={counterEvents} />
      </div>
      <div>
        Counter via Subscription component: <FromComponent stateEvents={counterEvents} />
      </div>
    </div>
  )
}
