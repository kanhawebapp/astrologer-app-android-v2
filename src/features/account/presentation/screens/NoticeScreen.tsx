// import { View } from "react-native"
// import { AppText, Header } from "../../../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useEffect } from "react"
// import { noticesApi } from "../../../../services/api/notice/notices.service"

// const NoticeScreen = () => {
//     const navigation = useNavigation<any>()

//     const fetchNotices = async () => {
//         try {
//             const response =
//                 await noticesApi.getAstrologerNotices();

//             console.log(
//                 'notices response:',
//                 JSON.stringify(
//                     response,
//                     null,
//                     2,
//                 ),
//             );
//            console.log("notice response",response)
//             const notices =
//                 response?.data?.getAstrologerNotices;

//             if (notices?.length) {
//                 console.log(
//                     'all notices:',
//                     notices,
//                 );

//                 // setNotices(notices);
//             }
//         } catch (error) {
//             console.log(
//                 'notices fetch error:',
//                 error,
//             );
//         }
//     };

//     useEffect(() => {
//         fetchNotices();
//     }, []);

//     return (
//         <View style={{ flex: 1, marginTop: 50 }}>
//             <Header showBack
//                 onBackPress={() => navigation.goBack()}
//                 title="Notice Board" />
//             <AppText>notice board</AppText>
//         </View>
//     )
// }
// export default NoticeScreen

import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {AppText, Header} from '../../../../components';
import {noticesApi} from '../../../../services/api/notice/notices.service';
import {useTheme} from '../../../../hooks/useTheme';

const NoticeScreen = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();

  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const response =
        await noticesApi.getAstrologerNotices();
      console.log("responsellllll",response)
      const noticeData =
        response?.getAstrologerNotices || [];

      setNotices(noticeData);
    } catch (error) {
      console.log('notices fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = (timestamp: string) => {
    if (!timestamp) {
      return '';
    }

    return new Date(
      Number(timestamp),
    ).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderNotice = ({item}: any) => (
    <View
      style={[
        styles.noticeCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}>
      <View style={styles.noticeHeader}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  item.isPinned
                    ? '#FFE9C7'
                    : '#EEF2FF',
              },
            ]}>
            <Ionicons
              name={
                item.isPinned
                  ? 'bookmark'
                  : 'megaphone'
              }
              size={18}
              color={
                item.isPinned
                  ? '#F59E0B'
                  : '#6366F1'
              }
            />
          </View>

          <View style={{flex: 1}}>
            <AppText style={styles.noticeTitle}>
              {item.title}
            </AppText>

            <View style={styles.badge}>
              <AppText style={styles.badgeText}>
                {item.targetType}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <AppText
        color={theme.colors.textSecondary}
        style={styles.description}>
        {item.description}
      </AppText>

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.isActive
                  ? '#22C55E'
                  : '#EF4444',
              },
            ]}
          />

          <AppText
            color={theme.colors.textSecondary}>
            {item.isActive
              ? 'Active'
              : 'Inactive'}
          </AppText>
        </View>

        <AppText
          color={theme.colors.textSecondary}>
          {formatDate(item.createdAt)}
        </AppText>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <Header
        showBack
        onBackPress={() => navigation.goBack()}
        title="Notice Board"
      />

      <View style={styles.topSection}>
        <AppText style={styles.heading}>
          Announcements
        </AppText>

        <AppText
          color={theme.colors.textSecondary}>
          Stay updated with latest notices and
          important information.
        </AppText>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={item => item.id}
          renderItem={renderNotice}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 30,
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={60}
                color="#CBD5E1"
              />

              <AppText
                style={{
                  marginTop: 12,
                  fontWeight: '600',
                }}>
                No Notices Found
              </AppText>

              <AppText
                color={theme.colors.textSecondary}>
                New notices will appear here.
              </AppText>
            </View>
          }
        />
      )}
    </View>
  );
};

export default NoticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:50
  },

  topSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },

  noticeCard: {
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
    borderWidth: 0.5,

    // shadowColor: '#000',
    // shadowOpacity: 0.04,
    // shadowRadius: 10,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },

    // elevation: 2,
  },

  noticeHeader: {
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    marginTop: 6,
  },

  badgeText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },

  description: {
    lineHeight: 22,
    marginBottom: 16,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
});

