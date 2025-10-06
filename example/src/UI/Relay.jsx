import React from 'react'

import {useStateEvents} from 'react-state-events'
import styles from './common.module.css'

const InnerRelay = ({stateEvents})=>{
  const [val] = useStateEvents(stateEvents);
  console.log(`Relay got ${val}`)
  return (
    <>{val}</>
  );
}

export default ({stateEvents})=>{
  const [mounted, setMounted] = React.useState(false);
  const toggleMounted = () => {
      setMounted(!mounted);
  };

  return (
    <div className={styles.block}>
        <div className={styles.controls}>
            <button onClick={toggleMounted}>
              {
                mounted ?
                  <>
                    Relay active <InnerRelay stateEvents={stateEvents} />
                  </>
                :
                  <>
                    Relay inactive
                  </>
              }
            </button>
        </div>
    </div>
  );
}
