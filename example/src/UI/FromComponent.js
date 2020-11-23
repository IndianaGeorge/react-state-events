import React, {useState, useEffect} from 'react'

import {Subscription} from 'react-state-events'

export default ({stateEvents})=>{
    const [value, setValue] = useState(1);
    useEffect(() => {
        stateEvents.subscribe(
            (data)=>setValue(data),
            ()=>{} //ignore stream errors
        );
    },[]);
    const onClick = ()=>{
        stateEvents.publish(value+1);
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
