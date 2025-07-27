import React from 'react'

import styles from './common.module.css'

export default (props)=>{
    const [mounted, setMounted] = React.useState(false);
    const toggleMounted = () => {
        setMounted(!mounted);
    };
    return (
        <>
          <div className={styles.block}>
              <div className={styles.controls}>
                  <button onClick={toggleMounted}>{mounted?'Unmount':'Mount'}</button>
              </div>
          </div>
          {mounted && (props.children || null)}
        </>
    );
}
