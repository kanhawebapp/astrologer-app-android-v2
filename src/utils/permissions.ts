
// import {
//     PermissionsAndroid,
//     Platform,
//     Linking,
// } from 'react-native';

// export const requestCallPermissions = async () => {
//     if (Platform.OS !== 'android') {
//         return true;
//     }

//     try {
//         console.log('================ PERMISSION DEBUG ================');

//         // BEFORE STATUS
//         const beforePhone = await PermissionsAndroid.check(
//             PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
//         );

//         const beforeAudio = await PermissionsAndroid.check(
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         );

//         console.log('📌 BEFORE CHECK');
//         console.log('READ_PHONE_STATE:', beforePhone);
//         console.log('RECORD_AUDIO:', beforeAudio);

//         // REQUEST

//         // const granted = await PermissionsAndroid.requestMultiple([
//         //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         //     PermissionsAndroid.PERMISSIONS.CAMERA,
//         // ]);

//         // const hasAll =
//         //     granted['android.permission.RECORD_AUDIO'] === 'granted';
//         const result = await PermissionsAndroid.requestMultiple([
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//             PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
//             PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
//             PermissionsAndroid.PERMISSIONS.CALL_PHONE,
//             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//         ]);

//         console.log('📌 REQUEST RESULT');
//         console.log(JSON.stringify(result, null, 2));

//         // AFTER STATUS
//         const afterPhone = await PermissionsAndroid.check(
//             PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
//         );

//         const afterAudio = await PermissionsAndroid.check(
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         );

//         console.log('📌 AFTER CHECK');
//         console.log('READ_PHONE_STATE:', afterPhone);
//         console.log('RECORD_AUDIO:', afterAudio);

//         console.log('=================================================');

//         const granted =
//             afterPhone && afterAudio;

//         if (!granted) {
//             console.log('❌ FINAL RESULT: PERMISSION FAILED');

//             Linking.openSettings();
//         } else {
//             console.log('✅ FINAL RESULT: ALL PERMISSIONS OK');
//         }

//         return granted;
//     } catch (e) {
//         console.log('❌ Permission error:', e);

//         return false;
//     }
// };

// import {
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';

// export const requestCallPermissions = async () => {
//   if (Platform.OS !== 'android') {
//     return true;
//   }

//   try {
//     const result = await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     ]);

//     const granted =
//       result['android.permission.RECORD_AUDIO'] === 'granted';

//     console.log('PERMISSION RESULT:', result);

//     return granted;
//   } catch (e) {
//     console.log('Permission error:', e);
//     return false;
//   }
// };


// import {
//   PermissionsAndroid,
//   Platform,
//   Linking,
// } from 'react-native';

// export const requestCallPermissions = async () => {
//   if (Platform.OS !== 'android') {
//     return true;
//   }

//   try {
//     const result = await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     ]);

//     console.log('PERMISSION RESULT:', result);

//     const phoneGranted =
//       result['android.permission.READ_PHONE_STATE'] === 'granted' ||
//       result['android.permission.READ_PHONE_STATE'] ===
//         'never_ask_again';

//     const audioGranted =
//       result['android.permission.RECORD_AUDIO'] === 'granted';

//     const granted = phoneGranted && audioGranted;

//     if (!granted) {
//       Linking.openSettings();
//     }

//     return granted;
//   } catch (e) {
//     console.log('Permission error:', e);
//     return false;
//   }
// };


// import {
//   PermissionsAndroid,
//   Platform,
//   Linking,
// } from 'react-native';

// export const requestCallPermissions = async () => {
//   if (Platform.OS !== 'android') {
//     return true;
//   }

//   try {
//     console.log(
//       '================ PERMISSION DEBUG ================',
//     );

//     const result = await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     ]);

//     console.log('📌 REQUEST RESULT');
//     console.log(JSON.stringify(result, null, 2));

//     const micGranted =
//       result['android.permission.RECORD_AUDIO'] ===
//       'granted';

//     const phoneGranted =
//       result['android.permission.READ_PHONE_STATE'] ===
//         'granted' ||
//       result['android.permission.READ_PHONE_STATE'] ===
//         'never_ask_again';

//     console.log('📌 FINAL STATUS');
//     console.log('MIC:', micGranted);
//     console.log('PHONE:', phoneGranted);

//     console.log(
//       '=================================================',
//     );

//     const granted = micGranted && phoneGranted;

//     if (!granted) {
//       console.log('❌ FINAL RESULT: PERMISSION FAILED');

//       Linking.openSettings();

//       return false;
//     }

//     console.log('✅ FINAL RESULT: ALL OK');

//     return true;
//   } catch (e) {
//     console.log('❌ Permission error:', e);

//     return false;
//   }
// };

import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

export const requestCallPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const result =
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);

    console.log(
      '📌 Permission Result:',
      result,
    );

    const micGranted =
      result['android.permission.RECORD_AUDIO'] ===
      'granted';

    return micGranted;
  } catch (e) {
    console.log('❌ Permission error:', e);

    return false;
  }
};