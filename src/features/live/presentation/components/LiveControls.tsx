import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';

interface LiveControlsProps {
  isLive: boolean;
  isMuted: boolean;
  onEndLive: () => void;
  onToggleMute: () => void;
  onSendRemedy: () => void;
}

export const LiveControls: React.FC<LiveControlsProps> = ({
  isLive,
  isMuted,
  onEndLive,
  onToggleMute,
  onSendRemedy,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isLive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.error }]}
        onPress={onEndLive}>
        <AppText style={{ color: colors.white }}>⏹ End</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.controlButton,
          { backgroundColor: isMuted ? colors.error : colors.surfaceSecondary },
        ]}
        onPress={onToggleMute}>
        <AppText style={{ color: isMuted ? colors.white : colors.text }}>
          {isMuted ? '🔇' : '🎤'}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.accentGold }]}
        onPress={onSendRemedy}>
        <AppText style={{ color: colors.white }}>🧿 Remedy</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default LiveControls;
