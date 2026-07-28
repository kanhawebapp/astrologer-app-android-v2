import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AppToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
  onDismiss: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
};

const COLOR_KEYS: Record<
  ToastType,
  { bg: string; bgLight: string; icon: string }
> = {
  success: { bg: 'success', bgLight: 'successLight', icon: 'success' },
  error: { bg: 'error', bgLight: 'errorLight', icon: 'error' },
  warning: { bg: 'warning', bgLight: 'warningLight', icon: 'warning' },
  info: { bg: 'info', bgLight: 'infoLight', icon: 'info' },
};

export const AppToast: React.FC<AppToastProps> = ({
  visible,
  message,
  type = 'info',
  title,
  duration = 3500,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [translateY, opacity, onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration, translateY, opacity, dismiss]);

  if (!visible) {
    return null;
  }

  const colors = COLOR_KEYS[type];
  const iconColor = theme.colors[colors.icon];
  const bgColor = theme.colors[colors.bgLight];
  const borderColor = theme.colors[colors.bg];

  const topOffset =
    insets.top + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Pressable
        onPress={dismiss}
        style={[
          styles.toast,
          {
            backgroundColor: bgColor,
            borderColor,
          },
        ]}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconColor + '22' }]}>
          <AppText variant="body2" color={iconColor} style={styles.icon}>
            {ICONS[type]}
          </AppText>
        </View>

        <View style={styles.textContainer}>
          {title && (
            <AppText
              variant="label"
              color={theme.colors.text}
              style={styles.title}>
              {title}
            </AppText>
          )}
          <AppText
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.message}>
            {message}
          </AppText>
        </View>

        <Pressable onPress={dismiss} hitSlop={8} style={styles.closeButton}>
          <AppText
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.closeIcon}>
            {'\u2715'}
          </AppText>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  message: {
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeIcon: {
    fontSize: 14,
  },
});
