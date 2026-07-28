import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/store/StoreProvider';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { GlobalOverlay } from './src/components/GlobalOverlay';
import { ToastProvider } from './src/hooks/useToast';
import { useChatSimulation } from './src/hooks/useChatSimulation';
import { useGlobalChatSocket } from './src/hooks/useGlobalChatSocket';
import { useGlobalCallSocket } from './src/hooks/useGlobalCallSocket';
import { useNotificationClickRouter } from './src/hooks/useNotificationClickRouter';
import { useCallKeepIntegration } from './src/hooks/useCallKeepIntegration';
import { SocketAuthBridge } from './src/components/SocketAuthBridge';
import { OneSignalSocketBridge } from './src/components/OneSignalSocketBridge';


const AppContent: React.FC = () => {
  useChatSimulation();
  useGlobalChatSocket();
  useGlobalCallSocket();
  useNotificationClickRouter();
  useCallKeepIntegration();

  return (
    <>
      <SocketAuthBridge />
      <OneSignalSocketBridge />
      <RootNavigator />
      <GlobalOverlay />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
