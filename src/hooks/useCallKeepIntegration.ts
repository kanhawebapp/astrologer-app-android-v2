import { useEffect } from 'react';
import { setupCallKeep, addCallKeepEventListeners, removeCallKeepEventListeners } from '../services/call/callkeep.service';
import { callActionBridge } from '../services/call/callActionBridge';

const DEBUG_PREFIX = '[useCallKeepIntegration]';

export const useCallKeepIntegration = () => {
  useEffect(() => {
    let isMounted = true;

    const initCallKeep = async () => {
      try {
        // console.log(`${DEBUG_PREFIX} Setting up CallKeep`);
        await setupCallKeep();

        if (!isMounted) {
          return;
        }

        // console.log(`${DEBUG_PREFIX} Adding CallKeep event listeners`);

        addCallKeepEventListeners(
          () => {
            // console.log(`${DEBUG_PREFIX} CallKeep answerCall received`);
            callActionBridge.accept();
          },
          () => {
            // console.log(`${DEBUG_PREFIX} CallKeep endCall received`);
            callActionBridge.reject();
          },
        );
      } catch (error: any) {
        console.log(`${DEBUG_PREFIX} CallKeep setup failed:`, error.message);
      }
    };

    initCallKeep();

    return () => {
      isMounted = false;
      // console.log(`${DEBUG_PREFIX} Cleaning up CallKeep listeners`);
      removeCallKeepEventListeners();
    };
  }, []);
};
