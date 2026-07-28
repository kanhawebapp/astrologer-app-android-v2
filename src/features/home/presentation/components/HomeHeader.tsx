import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { AstrologerProfile } from '../../domain/types';

const { width } = Dimensions.get('window');

interface HomeHeaderProps {
  profile: AstrologerProfile;
  onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  profile,
  onNotificationPress,
}) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={['#6C63FF', '#8B5CF6', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />
      <View style={styles.glowOrb3} />
      <View style={styles.topWave} />
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <View style={styles.imageBorder}>
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.profileImage}
              />
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: profile.isOnline
                    ? theme.colors.success
                    : theme.colors.textTertiary,
                },
              ]}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.greetingRow}>
              <AppText variant="body2" color="rgba(255,255,255,0.8)">
                Welcome back,
              </AppText>
              <View style={styles.premiumBadge}>
                <Icon name="workspace-premium" size={11} color="#FFD700" />
                <AppText
                  variant="caption"
                  color="#FFD700"
                  style={styles.premiumText}>
                  Premium
                </AppText>
              </View>
            </View>
            <AppText
              variant="h2"
              color={theme.colors.white}
              style={styles.nameText}>
              {profile.name}
            </AppText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="star" size={14} color="rgba(255,255,255,0.9)" />
                <AppText variant="caption" color="rgba(255,255,255,0.9)">
                  {profile.rating.toFixed(1)}
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="group" size={14} color="rgba(255,255,255,0.9)" />
                <AppText variant="caption" color="rgba(255,255,255,0.9)">
                  {profile.totalSessions.toLocaleString()}+
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="verified" size={14} color="rgba(255,255,255,0.9)" />
                <AppText variant="caption" color="rgba(255,255,255,0.9)">
                  Verified
                </AppText>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}>
          <View style={styles.notificationBg}>
            <Icon
              name="notifications-none"
              size={24}
              color={theme.colors.white}
            />
          </View>
          <View
            style={[
              styles.notificationDot,
              { backgroundColor: theme.colors.secondary },
            ]}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomWave} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#6C63FF',
  },
  glowOrb1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  glowOrb3: {
    position: 'absolute',
    top: '35%',
    right: '15%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  imageBorder: {
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 34,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  premiumText: {
    fontWeight: '700',
    fontSize: 10,
  },
  nameText: {
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  notificationBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    // backdropFilter: 'blur(10px)',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
});
