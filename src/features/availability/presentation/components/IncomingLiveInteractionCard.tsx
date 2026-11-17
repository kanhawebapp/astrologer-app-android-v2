import React, {memo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {LiveInteractionRequest} from '../../domain/liveInteractionTypes';

interface IncomingLiveInteractionCardProps {
  request: LiveInteractionRequest;
  guestName: string;
  queuedCount: number;
  isResponding: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingLiveInteractionCard = memo(
  ({
    request,
    guestName,
    queuedCount,
    isResponding,
    onAccept,
    onReject,
  }: IncomingLiveInteractionCardProps) => {
    const {theme} = useTheme();
    const colors = theme.colors;
    const isVideo = request.interactionType === 'VIDEO';
    const title = isVideo
      ? 'Incoming Video Call Request'
      : 'Incoming Audio Call Request';

    return (
      <View
        style={[styles.card, {backgroundColor: 'rgba(15,15,40,0.92)'}]}
        accessibilityRole="summary">
        <View style={styles.headerRow}>
          <View
            style={[
              styles.avatar,
              {backgroundColor: colors.cosmicLight ?? '#262667'},
            ]}>
            <Icon name="person" size={22} color={colors.white} />
          </View>
          <View style={styles.headerText}>
            <AppText variant="caption" color="rgba(255,255,255,0.7)">
              {title}
            </AppText>
            <AppText
              variant="body1"
              color={colors.white}
              numberOfLines={1}
              style={styles.name}>
              {guestName}
            </AppText>
          </View>
          <View style={styles.typePill}>
            <Icon
              name={isVideo ? 'videocam' : 'mic'}
              size={14}
              color={colors.white}
            />
            <AppText variant="caption" color={colors.white}>
              {isVideo ? 'Video' : 'Audio'}
            </AppText>
          </View>
        </View>

        {queuedCount > 1 ? (
          <AppText
            variant="caption"
            color="rgba(255,255,255,0.65)"
            style={styles.queueHint}>
            +{queuedCount - 1} more waiting
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.reject, {opacity: isResponding ? 0.6 : 1}]}
            onPress={onReject}
            disabled={isResponding}
            accessibilityLabel="Reject interaction request">
            {isResponding ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <AppText variant="button" color={colors.white}>
                Reject
              </AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.accept,
              {backgroundColor: colors.success, opacity: isResponding ? 0.6 : 1},
            ]}
            onPress={onAccept}
            disabled={isResponding}
            accessibilityLabel="Accept interaction request">
            {isResponding ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <AppText variant="button" color={colors.white}>
                Accept
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

IncomingLiveInteractionCard.displayName = 'IncomingLiveInteractionCard';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    marginTop: 2,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  queueHint: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reject: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  accept: {},
});

export default IncomingLiveInteractionCard;
