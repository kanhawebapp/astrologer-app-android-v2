import { useCallback } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

let lastBackPressed = 0;

const useDoubleBackExit = () => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressed = now;

        ToastAndroid.show(
          'Press back again to exit',
          ToastAndroid.SHORT,
        );

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );
};

export default useDoubleBackExit;