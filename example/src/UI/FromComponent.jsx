import React from 'react'

import {Subscription} from 'react-state-events'
import styles from './common.module.css'

export default ({stateEvents})=>{
    const onClick = ()=>{
        stateEvents.publish(stateEvents.getCurrent()+1);
    }
    const onError = (err)=>{
        console.log('FromComponent handled error:',err);
    };
    return (
        <Subscription stateEvents={stateEvents} onError={onError} >
            {(data)=>
                <div className={styles.block}>
                    <div className={styles.value}>
                        {data}
                    </div>
                    <div className={styles.controls}>
                        <button onClick={onClick}>add</button>
                        <button onClick={()=>stateEvents.error('Error sent in FromComponent')}>error</button>
                    </div>
                </div>
            }
        </Subscription>
    );
}
