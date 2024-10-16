import React from 'react';
import { StateEvents, ExternalStateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';
import MountOnClick from './UI/MountOnClick';
import styles from './App.module.css';

export default () => {
  const counterEvents = new StateEvents(0,"single counter");
  const extCounterEventsA = new ExternalStateEvents(0,"counter");
  const extCounterEventsB = new ExternalStateEvents(0,"counter");
  return (
    <div>
      <div className={styles.app}>

        <div className={styles.context}>
          <h1>StateEvents</h1>
          <div>
            <div className={styles.type}>
              <h2>useStateEvents hook</h2>
              <MountOnClick>
                <FromHook stateEvents={counterEvents} />
              </MountOnClick>
            </div>
            <div className={styles.type}>
              <h2>Subscription class</h2>
              <MountOnClick>
                <FromComponent stateEvents={counterEvents} />
              </MountOnClick>
            </div>
          </div>
        </div>

        <div className={styles.context}>
          <h1>ExternalStateEvents</h1>
          <div>
            <div className={styles.type}>
              <h2>useStateEvents hook</h2>
              <MountOnClick>
                <FromHook stateEvents={extCounterEventsA} />
              </MountOnClick>
            </div>
            <div className={styles.type}>
              <h2>Subscription class</h2>
              <MountOnClick>
                <FromComponent stateEvents={extCounterEventsB} />
              </MountOnClick>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
