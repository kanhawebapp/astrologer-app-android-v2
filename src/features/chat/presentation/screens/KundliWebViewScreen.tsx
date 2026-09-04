import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {Header} from '../../../../components';
import {useTheme} from '../../../../hooks/useTheme';
import {RootStackParamList} from '../../../../navigation/types';

type KundliWebViewRouteProp = RouteProp<RootStackParamList, 'KundliWebView'>;

const INJECTED_JAVASCRIPT = `
  (function() {
    try {
      Object.defineProperty(Document.prototype, 'referrer', {
        value: 'https://external-referrer.dhwaniastro.com/',
        configurable: true,
        writable: true,
      });
    } catch (e) {
      console.warn('[KundliWebView] Failed to override document.referrer:', e);
    }
  })();
`;

export const KundliWebViewScreen: React.FC = () => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<KundliWebViewRouteProp>();
  const {kundliUrl} = route.params || {kundliUrl: ''};

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}>
      <Header title="Kundli" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.webViewWrapper}>
        <WebView
          source={{uri: kundliUrl}}
          originWhitelist={['*']}
          injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
          scrollEnabled
          javaScriptEnabled
          domStorageEnabled
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
});

export default KundliWebViewScreen;
