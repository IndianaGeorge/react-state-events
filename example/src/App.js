import React from 'react';
import { StateEvents, ExternalStateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';
import styles from './App.module.css';

export default () => {
  const counterEvents = new StateEvents(0,"single counter");
  const extCounterEventsA = new ExternalStateEvents(0,"counter");
  const extCounterEventsB = new ExternalStateEvents(0,"counter");
  return (
    <div>
      <span className={styles.mode}>
        {process.env.NODE_ENV !== 'production'?'development mode':'production mode'}
      </span>
      <div className={styles.app}>

        <div className={styles.context}>
          <h1>StateEvents</h1>
          <div>
            <div className={styles.type}>
              <h2>useStateEvents hook</h2>
                <FromHook stateEvents={counterEvents} />
            </div>
            <div className={styles.type}>
              <h2>Subscription class</h2>
              <FromComponent stateEvents={counterEvents} />
            </div>
          </div>
        </div>

        <div className={styles.context}>
          <h1>ExternalStateEvents</h1>
          <div>
            <div className={styles.type}>
            <h2>useStateEvents hook</h2>
              <FromHook stateEvents={extCounterEventsA} />
            </div>
            <div className={styles.type}>
            <h2>Subscription class</h2>
              <FromComponent stateEvents={extCounterEventsB} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
