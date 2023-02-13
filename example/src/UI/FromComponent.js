import React from 'react'

import {Subscription} from 'react-state-events'

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
                <span>
                    {data}
                    <button onClick={onClick}>increment</button>
                    <button onClick={()=>stateEvents.error('Error sent in FromComponent')}>Generate error</button>
                </span>
            }
        </Subscription>
    );
}
