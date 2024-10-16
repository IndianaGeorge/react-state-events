import React from 'react'

import {useStateEvents} from 'react-state-events'
import styles from './common.module.css'

export default ({stateEvents})=>{
    const onError = (err)=>{
        console.log('FromHook handled error:',err);
    };
    const [val,setVal] = useStateEvents(stateEvents,onError);
    const onClick = ()=>setVal(val+1);
    return (
        <div className={styles.block}>
            <div className={styles.value}>
                {val}
            </div>
            <div className={styles.controls}>
                <button onClick={onClick}>add</button>
                <button onClick={()=>stateEvents.error('Error sent in FromHook')}>error</button>
            </div>
        </div>
    );
}
