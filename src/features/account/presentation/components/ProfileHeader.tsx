import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { AccountProfile } from '../../domain/types';
import { endLive } from '../../../availability/data/liveSessionRepository';
import { Config } from '../../../../config/env';

interface ProfileHeaderProps {
  profile: AccountProfile;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditPress,
}) => {
  const { theme } = useTheme();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('') 
      .toUpperCase()
      .slice(0, 2);
  };
 

  const IMAGE_BASE_URL = 'https://dhwaniastro.com';

  const renderAvatar = () => {
    const imageUrl = profile?.avatar
      ? `${IMAGE_BASE_URL}${profile.avatar}`
      : null;


    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }

    return (
      <View
        style={[
          styles.avatar,
          styles.initialsAvatar,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}>
        <AppText
          variant="h3"
          color={theme.colors.white}>
          {getInitials(
            profile.displayName || profile.name,
          )}
        </AppText>
      </View>
    );
  };

  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(profile.rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= roundedRating ? 'star' : 'star-outline'}
          size={16}
          color={
            i <= roundedRating
              ? theme.colors.accentGold
              : theme.colors.textTertiary
          }
        />,
      );
    }
    return stars;
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>{renderAvatar()}</View>
        </View>
        {/* <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
           <Icon name="create-outline" size={18} color={theme.colors.white} />
           <AppText variant="caption" color={theme.colors.white}>
             Edit
           </AppText>
         </TouchableOpacity> */}
      </View>

      <View style={styles.infoContainer}>
        <AppText variant="h3" color={theme.colors.white} style={styles.name}>
          {profile.displayName || profile.name}
        </AppText>

        <View style={styles.ratingRow}>
          <View style={styles.starContainer}>{renderStars()}</View>
          <AppText variant="body2" color={theme.colors.white}>
            {profile.rating.toFixed(1)}
          </AppText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText variant="h5" color={theme.colors.white}>
              {profile.experience}
            </AppText>
            <AppText variant="caption" color={theme.colors.white}>
              Years Exp.
            </AppText>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: theme.colors.white },
            ]}
          />
          <View style={styles.statItem}>
            <AppText variant="h5" color={theme.colors.white}>
              {profile.totalReviews.toLocaleString()}
            </AppText>
            <AppText variant="caption" color={theme.colors.white}>
              Total Reviews
            </AppText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding:5,
    marginHorizontal: 16,
    // marginTop: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    gap: 4,
  },
  infoContainer: {
    // marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
    gap: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
});