import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';

export const TermsOfService: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <Header
        title="Terms of Service"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.webViewWrapper}>
        <WebView
          source={{ uri: 'https://staging.dhwaniastro.com/astrologer/terms-and-conditions' }}
          originWhitelist={['*']}
          scrollEnabled
          nestedScrollEnabled
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          style={styles.webView}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewWrapper: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
