import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks';
import { AppText } from '../../../components/common/AppText';
import { GoBack } from '../../../components/common/GoBack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '../../../theme';
import { noticesApi } from '../../../services/api/notice/notices.service';
import { Header } from '../../../components';

const TABS = [
  { key: 'notification', label: 'Notification' },
  { key: 'notice', label: 'Notice' },
  { key: 'dos', label: "Do's & Don't" },
];

const ENGLISH_DOS_DONTS = [
  {
    id: 'en-1',
    text: 'Do not share your personal details, such as contact numbers or social media usernames, with any customer.',
  },
  {
    id: 'en-2',
    text: 'You need to be available for a minimum of 6 hours every day.',
  },
  { id: 'en-3', text: 'Always accept all calls and chats when you are online.' },
  {
    id: 'en-4',
    text: 'Greet the customer with a proper welcome note like: "Welcome to Dhwani Astro," or "Namaste, aapka swagat hai," or whichever greeting you are comfortable with.',
  },
  {
    id: 'en-5',
    text: 'Be respectful and polite to the customer in every manner.',
  },
  {
    id: 'en-6',
    text: 'Do not speak rudely to any user, even if the user is misbehaving with you.',
  },
  {
    id: 'en-7',
    text: 'Gender prediction is not provided to users; it is strictly illegal on Dhwani Astro.',
  },
  {
    id: 'en-8',
    text: 'Practices like black magic, vashikaran, or suggesting such poojas using these yantras are FORBIDDEN on Dhwani Astro.',
  },
];

const HINDI_DOS_DONTS = [
  {
    id: 'hi-1',
    text: 'किसी भी ग्राहक के साथ अपना व्यक्तिगत विवरण, जैसे संपर्क नंबर या सोशल मीडिया यूज़रनेम साझा न करें।',
  },
  { id: 'hi-2', text: 'आपको हर दिन न्यूनतम ४ घंटे के लिए उपलब्ध होना चाहिए।' },
  {
    id: 'hi-3',
    text: 'जब भी आप ऑनलाइन हों, सभी कॉल्स और चैट्स को हमेशा स्वीकार करें।',
  },
  {
    id: 'hi-4',
    text: 'ग्राहक का उचित स्वागत नोट के साथ अभिवादन करें जैसे: "ध्वनि एस्ट्रो में आपका स्वागत है," या "नमस्ते, आपका स्वागत है," या जो भी अभिवादन आपको सुविधाजनक लगे।',
  },
  { id: 'hi-5', text: 'हर तरह से ग्राहक के प्रति सम्मानजनक और विनम्र रहें।' },
  {
    id: 'hi-6',
    text: 'किसी भी उपयोगकर्ता से अशिष्टता से बात न करें, भले ही वह आपके साथ दुर्व्यवहार कर रहा हो।',
  },
  {
    id: 'hi-7',
    text: 'उपयोगकर्ताओं को लिंग भविष्यवाणी प्रदान नहीं की जाती है; यह ध्वनि एस्ट्रो पर सख्ती से अवैध है।',
  },
  {
    id: 'hi-8',
    text: 'काले जादू, वशीकरण जैसे अभ्यास या इन यंत्रों का उपयोग करके ऐसे पूजाओं का सुझाव देना ध्वनि एस्ट्रो पर निषिद्ध है।',
  },
];

const AstrologerUpdatesScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('notification');

  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesApi.getAstrologerNotices();
      const noticeData = response?.getAstrologerNotices || [];
      setNotices(noticeData);
    } catch (error) {
      console.log('notices fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notice') {
      fetchNotices();
    }
  }, [activeTab]);

  const formatDate = (timestamp: string) => {
    if (!timestamp) {
      return '';
    }
    return new Date(Number(timestamp)).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderNotice = ({ item }: any) => (
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
                backgroundColor: item.isPinned ? '#FFE9C7' : '#EEF2FF',
              },
            ]}>
            <Ionicons
              name={item.isPinned ? 'bookmark' : 'megaphone'}
              size={18}
              color={item.isPinned ? '#F59E0B' : '#6366F1'}
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppText style={styles.noticeTitle}>{item.title}</AppText>

            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{item.targetType}</AppText>
            </View>
          </View>
        </View>
      </View>

      <AppText color={theme.colors.textSecondary} style={styles.description}>
        {item.description}
      </AppText>

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.isActive ? '#22C55E' : '#EF4444',
              },
            ]}
          />

          <AppText color={theme.colors.textSecondary}>
            {item.isActive ? 'Active' : 'Inactive'}
          </AppText>
        </View>

        <AppText color={theme.colors.textSecondary}>
          {formatDate(item.createdAt)}
        </AppText>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notification':
        return (
          <View style={styles.comingSoonContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}>
              <Ionicons
                name="notifications-outline"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <AppText style={[styles.title, { color: theme.colors.text }]}>
              Coming Soon
            </AppText>
            <AppText color={theme.colors.textSecondary} style={styles.message}>
              Notifications will be available soon.{'\n'}
              Stay tuned for updates and important activity alerts.
            </AppText>
          </View>
        );
      case 'notice':
        return (
          <View style={styles.noticeContainer}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={{ marginTop: 50 }}
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

                    <AppText color={theme.colors.textSecondary}>
                      New notices will appear here.
                    </AppText>
                  </View>
                }
              />
            )}
          </View>
        );
      case 'dos':
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <AppText
                style={[styles.sectionTitle, { color: theme.colors.text }]}>
                English
              </AppText>
              {ENGLISH_DOS_DONTS.map(item => (
                <View key={item.id} style={styles.listItem}>
                  <View
                    style={[
                      styles.bullet,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  <AppText
                    color={theme.colors.textSecondary}
                    style={styles.listText}>
                    {item.text}
                  </AppText>
                </View>
              ))}
              <View style={styles.note}>
                <AppText
                  color={theme.colors.textSecondary}
                  style={styles.noteBold}>
                  Note:{' '}
                </AppText>
                <AppText color={theme.colors.textSecondary}>
                  If Dhwani Astro finds any policy being violated, strict action
                  will be taken.
                </AppText>
              </View>
            </View>
            <View style={[styles.section, { marginTop: spacing.xxl }]}>
              <AppText
                style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Hindi
              </AppText>
              {HINDI_DOS_DONTS.map(item => (
                <View key={item.id} style={styles.listItem}>
                  <View
                    style={[
                      styles.bullet,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  <AppText
                    color={theme.colors.textSecondary}
                    style={styles.listText}>
                    {item.text}
                  </AppText>
                </View>
              ))}
              <View style={styles.note}>
                <AppText
                  color={theme.colors.textSecondary}
                  style={styles.noteBold}>
                  नोट:{' '}
                </AppText>
                <AppText color={theme.colors.textSecondary}>
                  यदि ध्वनि एस्ट्रो को किसी भी नीति के उल्लंघन का पता चलता है,
                  तो सख्त कार्रवाई की जाएगी।
                </AppText>
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Astrologer Updates"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}>
            <AppText
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === tab.key
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                },
              ]}>
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
};

export default AstrologerUpdatesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0CF',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  noticeContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: 40,
  },
  section: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: spacing.md,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
    fontSize: 14,
  },
  note: {
    marginTop: spacing.lg,
    lineHeight: 22,
  },
  noteBold: {
    fontWeight: '600',
  },
  noticeCard: {
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
    borderWidth: 0.5,
  },
  noticeHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
