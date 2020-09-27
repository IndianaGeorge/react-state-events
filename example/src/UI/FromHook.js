import React from 'react'

import {useStateEvents} from 'react-state-events'

export default ({stateEvents})=>{
    const onError = (err)=>{
        console.log('FromHook handled error:',err);
    };
    const [val,setVal] = useStateEvents(1,stateEvents,onError);
    const onClick = ()=>setVal(val+1);
    return (
        <span>
            {val}
            <button onClick={onClick}>increment</button>
            <button onClick={()=>stateEvents.error('Error sent in FromHook')}>Generate error</button>
        </span>
    );
}
