import React, { memo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Insight } from '../../domain/types';

interface InsightCardsProps {
  insights: Insight[];
  onInsightPress?: (insight: Insight) => void;
}

interface InsightCardProps {
  insight: Insight;
  onPress?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = memo(({ insight, onPress }) => {
  const { theme, mode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getIconConfig = () => {
    switch (insight.type) {
      case 'achievement':
        return { name: 'emoji-events', color: theme.colors.accentGold };
      case 'tip':
        return { name: 'lightbulb', color: theme.colors.info };
      case 'alert':
        return { name: 'warning', color: theme.colors.warning };
      case 'trend':
        return { name: 'trending-up', color: theme.colors.success };
      default:
        return { name: 'info', color: theme.colors.primary };
    }
  };

  const getBackgroundColor = () => {
    switch (insight.type) {
      case 'achievement':
        return theme.colors.accentGoldLight;
      case 'tip':
        return theme.colors.infoLight;
      case 'alert':
        return theme.colors.warningLight;
      case 'trend':
        return theme.colors.successLight;
      default:
        return theme.colors.primaryLight;
    }
  };

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const iconConfig = getIconConfig();
  const bgColor = getBackgroundColor();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon name={iconConfig.name} size={22} color={iconConfig.color} />
        </View>
        <View style={styles.content}>
          <AppText
            variant="body1"
            style={[styles.title, { color: theme.colors.text }]}>
            {insight.title}
          </AppText>
          <AppText
            variant="caption"
            style={[styles.description, { color: theme.colors.textSecondary }]}>
            {insight.description}
          </AppText>
        </View>
        {insight.value && (
          <View
            style={[
              styles.valueBadge,
              {
                backgroundColor:
                  insight.type === 'alert'
                    ? theme.colors.errorLight
                    : insight.type === 'achievement'
                    ? theme.colors.successLight
                    : theme.colors.primaryLight,
              },
            ]}>
            <AppText
              variant="body2"
              style={{
                color:
                  insight.type === 'alert'
                    ? theme.colors.error
                    : insight.type === 'achievement'
                    ? theme.colors.success
                    : theme.colors.primary,
                fontWeight: '700',
              }}>
              {insight.value}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export const InsightCards: React.FC<InsightCardsProps> = memo(
  ({ insights, onInsightPress }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="insights" size={22} color={theme.colors.primary} />
          <AppText
            variant="h4"
            style={[styles.headerTitle, { color: theme.colors.text }]}>
            Insights
          </AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onPress={() => onInsightPress?.(insight)}
            />
          ))}
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: {
    marginLeft: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 260,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
});
