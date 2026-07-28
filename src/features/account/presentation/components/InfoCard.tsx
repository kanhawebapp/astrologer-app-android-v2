import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface InfoCardProps {
  title: string;
  items: string[];
  icon?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, items }) => {
  const { theme } = useTheme();

  const getIcon = (title: string): string => {
    if (title === 'Skills') return 'star';
    if (title === 'Languages') return 'language';
    return 'information-circle';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.titleRow}>
        <Icon name={getIcon(title)} size={18} color={theme.colors.primary} />
        <AppText
          variant="label"
          color={theme.colors.textSecondary}
          style={styles.title}>
          {title}
        </AppText>
      </View>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.chip,
              {
                backgroundColor: theme.colors.primaryLight + '20',
                borderColor: theme.colors.primaryLight,
              },
            ]}>
            <AppText variant="caption" color={theme.colors.primary}>
              {item}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
});
