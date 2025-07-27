import React from 'react';
import { LocalStateEvents, MessageStateEvents } from 'react-state-events';

import FromHook from './UI/FromHook';
import FromComponent from './UI/FromComponent';
import MountOnClick from './UI/MountOnClick';
import styles from './App.module.css';

export default () => {
  const counterEvents = new LocalStateEvents(0,"single counter", true);
  const extCounterEventsA = new MessageStateEvents(0,"counter", window.opener ? {targets: [{source: window.opener, origin: window.opener.origin}]}: {}, true);
  const extCounterEventsB = new MessageStateEvents(0,"counter", true);
  function openPopup() {
    const popup = window.open(window.URL, '_blank', 'popup');
    extCounterEventsA.addTarget(popup, window.origin);
  }

  return (
    <div>
      <button onClick={openPopup}>Open popup</button>
      <div className={styles.app}>

        <div className={styles.context}>
          <h1>LocalStateEvents</h1>
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
          <h1>MessageStateEvents</h1>
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
