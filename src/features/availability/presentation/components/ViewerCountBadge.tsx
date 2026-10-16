import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components/common/AppText';

interface ViewerCountBadgeProps {
  count: number;
}

/**
 * Compact live audience badge. Memoized so RTC/chat count ticks do not
 * re-render the rest of the broadcast chrome.
 */
export const ViewerCountBadge = memo(({count}: ViewerCountBadgeProps) => {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const label = safeCount === 1 ? '1 viewer' : `${safeCount} viewers`;

  return (
    <View
      style={styles.badge}
      accessibilityRole="text"
      accessibilityLabel={label}>
      <Icon name="eye-outline" size={14} color="#FFFFFF" />
      <AppText variant="caption" color="#FFFFFF">
        {safeCount}
      </AppText>
    </View>
  );
});

ViewerCountBadge.displayName = 'ViewerCountBadge';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
});

export default ViewerCountBadge;
