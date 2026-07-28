
// import CallKeep from 'react-native-callkeep';
// // import { v4 as uuidv4 } from 'uuid';
// export const testIncomingCall = () => {
//   const callUUID = 'test-call-123';
//   console.log('Simulating incoming call with UUID:', callUUID);

//   CallKeep.setAvailable(true);

//   CallKeep.displayIncomingCall(
//     callUUID,
//     'Test Astrologer',
//     'Incoming Test Call'
//   );
// };


import CallKeep from 'react-native-callkeep';

export const testIncomingCall = () => {

  const callUUID = Date.now().toString();

  console.log('📞 Simulating incoming call:', callUUID);

  CallKeep.displayIncomingCall(
    callUUID,
    'Test Astrologer',
    'Incoming Test Call',
    'number',
    true
  );
};
