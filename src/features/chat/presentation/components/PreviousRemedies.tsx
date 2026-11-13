import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import type { PreviousRemedy } from '../../../../services/api/previousRemedies/previousRemedies.types';

interface PreviousRemediesProps {
  remedies: PreviousRemedy[];
  loading?: boolean;
  error?: string | null;
  onUseAgain: (remedy: PreviousRemedy) => void;
  onRetry?: () => void;
}

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const getRemediesMaxHeight = () => {
  const { height } = Dimensions.get('window');
  // ~1.5–2 cards visible; clamp for small/large screens
  return Math.round(Math.min(300, Math.max(220, height * 0.32)));
};

export const PreviousRemedies: React.FC<PreviousRemediesProps> = ({
  remedies,
  loading = false,
  error = null,
  onUseAgain,
  onRetry,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [expanded, setExpanded] = useState(true);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const maxHeight = useMemo(() => getRemediesMaxHeight(), []);

  const updateScrollHint = useCallback(
    (offsetY: number, layoutHeight: number, fullContentHeight: number) => {
      const hasOverflow = fullContentHeight > layoutHeight + 4;
      const remaining = fullContentHeight - layoutHeight - offsetY;
      setCanScrollDown(hasOverflow && remaining > 8);
    },
    [],
  );

  const handleUseAgain = useCallback(
    (remedy: PreviousRemedy) => {
      const cleaned = stripHtml(remedy.remedyText);
      onUseAgain({
        ...remedy,
        remedyText: cleaned || remedy.remedyText,
      });
    },
    [onUseAgain],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      updateScrollHint(
        contentOffset.y,
        layoutMeasurement.height,
        contentSize.height,
      );
    },
    [updateScrollHint],
  );

  const handleContentSizeChange = useCallback(
    (_w: number, h: number) => {
      setContentHeight(h);
      updateScrollHint(0, viewportHeight, h);
    },
    [updateScrollHint, viewportHeight],
  );

  const handleScrollLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const h = event.nativeEvent.layout.height;
      setViewportHeight(h);
      updateScrollHint(0, h, contentHeight);
    },
    [contentHeight, updateScrollHint],
  );

  if (loading) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText
          variant="caption"
          style={{ color: colors.textSecondary, marginLeft: 8 }}>
          Loading previous remedies...
        </AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.statusContainer}>
        <AppText
          variant="caption"
          style={{ color: colors.error, flex: 1 }}>
          Couldn't load previous remedies
        </AppText>
        {onRetry ? (
          <TouchableOpacity onPress={onRetry} hitSlop={8}>
            <AppText
              variant="caption"
              style={{ color: colors.primary, fontWeight: '600' }}>
              Retry
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (!remedies.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded(prev => !prev)}
        style={[
          styles.header,
          {
            backgroundColor: colors.accentPurpleLight || `${colors.primary}14`,
            borderColor: `${colors.primary}55`,
          },
        ]}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIconCircle,
              { backgroundColor: colors.primary },
            ]}>
            <Icon name="history" size={16} color={colors.white} />
          </View>

          <AppText
            style={[styles.headerTitle, { color: colors.primary }]}
            numberOfLines={1}>
            Previously Sent Remedies
          </AppText>

          <View
            style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <AppText style={styles.countBadgeText}>{remedies.length}</AppText>
          </View>
        </View>

        <Icon
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={[styles.listShell, { maxHeight }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onLayout={handleScrollLayout}
            onContentSizeChange={handleContentSizeChange}>
            {remedies.map((item, index) => {
              const displayText = stripHtml(item.remedyText) || item.remedyText;
              const sessionType = (item.sessionType || '').toUpperCase();

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.white || colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <AppText
                    style={[styles.remedyTitle, { color: colors.primary }]}>
                    Remedy #{index + 1}
                  </AppText>

                  <AppText
                    numberOfLines={3}
                    style={[
                      styles.remedyText,
                      { color: colors.textSecondary },
                    ]}>
                    {displayText}
                  </AppText>

                  <View style={styles.cardFooter}>
                    <AppText
                      style={[
                        styles.sessionType,
                        { color: colors.textTertiary },
                      ]}
                      numberOfLines={1}>
                      Session Type: {sessionType || 'Chat'}
                    </AppText>

                    <TouchableOpacity
                      style={[
                        styles.useAgainButton,
                        {
                          backgroundColor:
                            colors.accentPurpleLight || `${colors.primary}18`,
                        },
                      ]}
                      onPress={() => handleUseAgain(item)}
                      activeOpacity={0.8}>
                      <AppText
                        style={[
                          styles.useAgainText,
                          { color: colors.primary },
                        ]}>
                        Use Again
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {canScrollDown ? (
            <View pointerEvents="none" style={styles.scrollHint}>
              <View
                style={[
                  styles.scrollHintFade,
                  { backgroundColor: `${colors.primary}18` },
                ]}
              />
              <View
                style={[
                  styles.scrollHintChip,
                  {
                    backgroundColor: colors.white || colors.surface,
                    borderColor: `${colors.primary}40`,
                  },
                ]}>
                <Icon
                  name="keyboard-arrow-down"
                  size={16}
                  color={colors.primary}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listShell: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  remedyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  remedyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sessionType: {
    flex: 1,
    fontSize: 12,
    marginRight: 10,
  },
  useAgainButton: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  useAgainText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  scrollHintFade: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollHintChip: {
    width: 28,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PreviousRemedies;
