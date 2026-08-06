import React from 'react';
import {useOneSignalSocket} from '../hooks/useOneSignalSocket';

export const OneSignalSocketBridge: React.FC = () => {
  // console.log('[OneSignalSocketBridge] component rendering -> useOneSignalSocket will run');
  useOneSignalSocket();
  return null;
};

export default OneSignalSocketBridge;
