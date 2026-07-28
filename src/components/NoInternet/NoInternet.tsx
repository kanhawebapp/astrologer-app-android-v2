import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';

interface Props {
  onRetry?: () => void;
}

const NoInternet: React.FC<Props> = ({ onRetry }) => {
  const retryConnection = async () => {
    const state = await NetInfo.fetch();

    if (state.isConnected) {
      onRetry?.();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
      />

      <Icon
        name="wifi-off"
        size={110}
        color="#E53935"
      />

      <Text style={styles.title}>
        No Internet Connection
      </Text>

      <Text style={styles.description}>
        Your internet connection appears to be offline.
        Please check your WiFi or Mobile Data and try again.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={retryConnection}
      >
        <Text style={styles.buttonText}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginTop: 25,
  },

  description: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },

  button: {
    marginTop: 35,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 45,
    paddingVertical: 15,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});