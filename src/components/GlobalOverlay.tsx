import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearGlobalMessages } from '../store/slices/appSlice';
import { AppText } from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';

export const GlobalOverlay: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { globalError, globalSuccess, globalLoading } = useSelector(
    (state: RootState) => state.app,
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const message = globalError || globalSuccess;
  const isError = !!globalError;

  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dispatch(clearGlobalMessages());
      });
    }
  }, [message]);

  if (!message) {
    return null;
  }

  const bgColor = isError ? theme.colors.error : theme.colors.success;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => dispatch(clearGlobalMessages())}
        activeOpacity={0.8}>
        <AppText variant="body2" color={theme.colors.white}>
          {message}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
});
