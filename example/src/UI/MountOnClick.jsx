import React from 'react'

import styles from './common.module.css'

export default (props)=>{
    const [mounted, setMounted] = React.useState(false);
    const mount = () => {
        setMounted(true);
    };
    return mounted ? (
        <>
            {props.children || null}
        </>
    ) : (
        <div className={styles.block}>
            <div className={styles.controls}>
                <button onClick={mount}>Mount</button>
            </div>
        </div>
    );
}
