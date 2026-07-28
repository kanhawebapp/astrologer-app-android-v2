import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackHeader } from './BackHeader';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../layout/Header';

interface BackgroundLayoutProps {
  title: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  scrollEnabled?: boolean;
}

export const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({
  title,
  children,
  contentStyle,
  scrollEnabled = true,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}>
      <StatusBar
        barStyle={
          colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={colors.background}
      />

      {scrollEnabled ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.staticContent,
            { paddingBottom: insets.bottom + 16 },
            contentStyle,
          ]}>
          {children}
        </View>
      )}
      <Header title={title} showBack={true} />
      {/* <BackHeader title={title}  /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  staticContent: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
  },
});
