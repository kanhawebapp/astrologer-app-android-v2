import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { QuickAction } from '../../domain/types';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionPress,
}) => {
  const { theme } = useTheme();

  const getActionGradient = (actionId: string): string[] => {
    switch (actionId) {
      case 'action_001':
        return ['#FF6B6B', '#EE5A5A'];
      case 'action_002':
        return ['#6C63FF', '#5A52E0'];
      case 'action_003':
        return ['#10B981', '#059669'];
      case 'action_004':
        return ['#F59E0B', '#D97706'];
      default:
        return [theme.colors.primary, theme.colors.primaryDark || '#4A42DB'];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <AppText variant="h5" color={theme.colors.text} style={styles.title}>
          Quick Actions
        </AppText>
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.seeAllButton}>
            <AppText variant="body2" color={theme.colors.primary}>
              See All
            </AppText>
            <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.actionsRow}>
        {actions.map((action, index) => {
          const gradient = getActionGradient(action.id);
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => onActionPress(action)}
              activeOpacity={0.7}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}>
                <View style={styles.iconGlow1} />
                <View style={styles.iconGlow2} />
                <Icon name={action.icon} size={26} color={theme.colors.white} />
              </LinearGradient>
              <AppText
                variant="body2"
                color={theme.colors.text}
                style={styles.actionLabel}
                numberOfLines={1}>
                {action.label}
              </AppText>
              {index === 0 && (
                <View style={styles.newBadge}>
                  <AppText
                    variant="caption"
                    color="#FFFFFF"
                    style={styles.newBadgeText}>
                    NEW
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 22,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  title: {
    marginBottom: 0,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  iconGlow1: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 35,
  },
  iconGlow2: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actionLabel: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontWeight: '700',
    fontSize: 8,
  },
});
