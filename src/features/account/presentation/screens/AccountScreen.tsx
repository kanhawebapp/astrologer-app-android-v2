import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ScreenContainer} from '../../../../components/layout/ScreenContainer';
import {Header} from '../../../../components/layout/Header';
import {AppText} from '../../../../components/common/AppText';
import {useTheme} from '../../../../hooks/useTheme';
import {useAuth} from '../../../../hooks/useAuth';
import {useAccount} from '../hooks/useAccount';
import {ProfileHeader} from '../components/ProfileHeader';
import {StatusToggleCard} from '../components/StatusToggleCard';
import {StatsCard} from '../components/StatsCard';
import {InfoCard} from '../components/InfoCard';
import {SettingList} from '../components/SettingList';
import {LogoutButton} from '../components/LogoutButton';
import {astrologerServicesApi} from '../../../../services/api/AvailvalityToggle/toggleAstrologerService.service';
import ReviewActionCard from './ReviewActionCard';
import {appVersionApi} from '../../../../services/api/version/version.api';

export const AccountScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const {logout} = useAuth();

  const {
    dashboard,
    profile,
    pricing,
    // availability,
    stats,
    loading,
    updating,
    refreshDashboard,
    updateAvailability,
    updatePricing,
    fetchReviews,
  } = useAccount();

  const [refreshing, setRefreshing] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [availability, setAvailability] = useState<any>('');
  const [version, setVersion] = useState<any>('');

  const fetchServices = useCallback(async () => {
    try {
      const response = await astrologerServicesApi.getAstrologerServices({
        astrologerId: profile?.id,
      });

      // console.log('services response:', JSON.stringify(response, null, 2));
      setAvailability(response?.getAstrologerById);
    } catch (error) {
      console.log('services fetch error:', error);
    }
  }, [profile?.id]);

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      refreshDashboard(),
      // fetchAnalytics(),
      fetchServices(),
      fetchReviews(),
    ]);
    setRefreshing(false);
  }, [
    refreshDashboard,
    //  fetchAnalytics,
    fetchServices,
    fetchReviews,
  ]);

  const handleLogout = useCallback(() => {
    console.log('Logout initiated');
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  }, [logout]);

  const handleSettingPress = useCallback(
    (id: string) => {
      switch (id) {
        case 'edit_profile':
          navigation.navigate('EditProfile' as never);
          break;
        case 'change_language':
          Alert.alert(
            'Change Language',
            'Language selection will be available soon.',
          );
          break;
        case 'terms_conditions':
          navigation.navigate('TermsOfService' as never);
          break;
        case 'privacy_policy':
          navigation.navigate('PrivacyPolicy' as never);
          break;
        case 'support':
          Alert.alert(
            'Support',
            'Contact support@dhwaniastro.com for assistance.',
          );
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  const handleToggleSetting = useCallback((id: string, value: boolean) => {
    if (id === 'notifications') {
      setNotificationEnabled(value);
      Alert.alert(
        'Notifications',
        value ? 'Notifications enabled' : 'Notifications disabled',
      );
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchReviews();
  }, [availability]);

  const togglePromotionalService = async (
    serviceType: 'CHAT' | 'CALL' | 'LIVE' | 'PROMOTIONAL',
    status: boolean,
  ) => {
    try {
      const response = await astrologerServicesApi.toggleAstrologerService({
        astrologerId: profile?.id || '',
        serviceType,
        status,
      });

      const result = response?.data?.toggleAstrologerService;

      if (result?.success) {
        console.log(result.message);

        fetchServices(); // refresh switches
      }
    } catch (error) {
      console.log('toggle service error:', error);
    } finally {
      fetchServices();
    }
  };

  ////////////------end service availablity-------

  const actions = [
    {
      title: 'My Reviews',
      subtitle: `${profile?.totalReviews} reviews received`,
      onPress: () => navigation.navigate('AllReviewScreen' as never),
    },
    {
      title: 'My Offers',
      onPress: () => navigation.navigate('OfferScreen' as never),
    },
    {
      title: 'My Followers',
      onPress: () =>
        navigation.navigate('AllFollowers', {
          astrologerId: profile?.id,
        }),
    },
    {
      title: 'My Remedies',
      onPress: () => navigation.navigate('MyRemedies'),
    },
    // {
    //   title: 'My Services',
    //   onPress: () => navigation.navigate('MyServices'),
    // },
  ];

  const isInitialLoading = loading && !dashboard;

  //version

  const checkAppVersion = async () => {
    try {
      const res = await appVersionApi.getAstrologerAppVersion({
        platform: 'ANDROID',
      });

      const data = res.getAstrologerAppVersion;

      // console.log('Version API response:', data);
      setVersion(data.data);

      if (data.success) {
        const versionInfo = data.data;

        // 👉 your logic here
        if (versionInfo.maintenanceMode) {
          // show maintenance screen
        }

        if (versionInfo.forceUpdate) {
          // force update modal
        }
      }
    } catch (err) {
      console.log('Version API error:', err);
    }
  };

  useEffect(() => {
    checkAppVersion();
  }, []);

  if (isInitialLoading) {
    return (
      <ScreenContainer scrollable={false} withPadding={false}>
        <Header title="Control Center" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataEmoji}>😕</Text>

            <AppText variant="h5" style={styles.noDataTitle}>
              No Data Found
            </AppText>

            <AppText
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.noDataDescription}>
              We couldn't load your profile information right now. Please try
              again later or logout and login again.
            </AppText>

            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={handleRefresh}>
              <AppText variant="body2" color="#fff">
                Refresh
              </AppText>
            </TouchableOpacity>

            <View style={styles.logoutContainer}>
              <LogoutButton onLogout={handleLogout} />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Header title="Control Center" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>
        {profile && (
          <ProfileHeader
            profile={profile}
            onEditPress={() => handleSettingPress('edit_profile')}
          />
        )}

        {availability && (
          <StatusToggleCard
            availability={availability}
            onToggle={togglePromotionalService}
            loading={updating}
          />
        )}

        {stats && profile && <StatsCard stats={stats} profile={profile} />}

        {profile && (
          <>
            <InfoCard title="Skills" items={profile.skills} />
            <InfoCard title="Languages" items={profile.languages} />

            <View
              style={[
                styles.aboutContainer,
                {backgroundColor: theme.colors.surface},
              ]}>
              <AppText
                variant="label"
                color={theme.colors.textSecondary}
                style={styles.aboutLabel}>
                ABOUT
              </AppText>
              <AppText variant="body2" color={theme.colors.text}>
                {profile.about}
              </AppText>
            </View>
          </>
        )}
        {actions.map((item, index) =>
          item.subtitle && !profile ? null : (
            <ReviewActionCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              theme={theme}
              onPress={item.onPress}
            />
          ),
        )}

        {/* <SettingList
          settings={[]}
          onSettingPress={handleSettingPress}
          onToggle={handleToggleSetting}
        /> */}

        <LogoutButton onLogout={handleLogout} />
        <Text
          style={{
            textAlign: 'center',
            color: theme.colors.textSecondary,
            marginVertical: 8,
          }}>
          {`Version: ${version?.latestVersion || '1.0.0'}`}
        </Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryLoader: {
    marginTop: 16,
  },
  mockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  aboutContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aboutLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewsButton: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  reviewsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  reviewsIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsButtonText: {
    flex: 1,
    gap: 2,
    borderWidth: 0,
  },
  bottomSpacer: {
    height: 40,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  noDataEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },

  noDataTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },

  noDataDescription: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutContainer: {
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
});
