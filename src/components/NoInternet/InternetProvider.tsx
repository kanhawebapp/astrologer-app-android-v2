// import React, { useEffect, useState } from 'react';

// import NetInfo from '@react-native-community/netinfo';
// import NoInternet from './NoInternet';

// interface Props {
//     children: React.ReactNode;
// }

// const InternetProvider: React.FC<Props> = ({ children }) => {
//     const [connected, setConnected] = useState(true);

//     //   useEffect(() => {
//     //     const unsubscribe = NetInfo.addEventListener(state => {
//     //       setConnected(
//     //         state.isConnected === true &&
//     //         state.isInternetReachable !== false,
//     //       );
//     //     });

//     //     return unsubscribe;
//     //   }, []);

//     useEffect(() => {
//         const unsubscribe = NetInfo.addEventListener(state => {
//             console.log('======== NET INFO ========');
//             console.log(state);

//             console.log('isConnected:', state.isConnected);
//             console.log('isInternetReachable:', state.isInternetReachable);
//             console.log('type:', state.type);

//             setConnected(
//                 state.isConnected === true &&
//                 state.isInternetReachable !== false,
//             );
//         });

//         return unsubscribe;
//     }, []);

//     if (!connected) {
//         return (
//             <NoInternet
//                 onRetry={() => setConnected(true)}
//             />
//         );
//     }

//     return <>{children}</>;
// };

// export default InternetProvider;

import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';

const InternetProvider = ({ children }) => {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setConnected(!!state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setConnected(!!state.isConnected);
    });

    return unsubscribe;
  }, []);

  if (!connected) {
    return <NoInternet />;
  }

  return children;
};

export default InternetProvider;

