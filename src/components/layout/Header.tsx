import React from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from '../common/AppText';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightComponent,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          // backgroundColor: theme.colors.background,
          // borderBottomColor: theme.colors.border,
        },
      ]}>
      <View style={styles.left}>
        {showBack && onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AppText variant="h5" color={theme.colors.primary}>
              {'<'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
      <AppText variant="h5">{title}</AppText>
      <View style={styles.right}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
  },
  left: {
    minWidth: 40,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
});
