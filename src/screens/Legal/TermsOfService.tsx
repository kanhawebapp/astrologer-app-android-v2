import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppText } from '../../components/common/AppText';
import { BackgroundLayout } from '../../components/common/BackgroundLayout';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components';
import { useNavigation } from '@react-navigation/native';

interface SectionProps {
  title: string;
  body: string;
  index: number;
  colors: Record<string, string>;
}

const Section: React.FC<SectionProps> = ({ title, body, index, colors }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionBadge,
          { backgroundColor: colors.primary + '18' },
        ]}>
        <AppText
          variant="body2"
          color={colors.primary}
          style={styles.sectionBadgeText}>
          {index}
        </AppText>
      </View>
      <AppText variant="h5" color={colors.text} style={styles.sectionTitle}>
        {title}
      </AppText>
    </View>
    <AppText
      variant="body2"
      color={colors.textSecondary}
      style={styles.sectionBody}>
      {body}
    </AppText>
  </View>
);

export const TermsOfService: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation()

  const sections = [
    {
      title: 'Acceptance of Terms',
      body: 'By accessing or using the Dhwani Astrologer application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all users, including visitors, registered users, and premium subscribers.',
    },
    {
      title: 'Description of Service',
      body: 'Dhwani Astrologer provides astrological consultations, horoscope readings, and related spiritual guidance services. Our platform connects users with professional astrologers for personalized readings via chat, call, or video. All consultations are intended for entertainment and personal guidance purposes only.',
    },
    {
      title: 'User Accounts',
      body: 'To access certain features, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
    },
    {
      title: 'Payment & Refunds',
      body: 'Consultation fees are charged per session or through subscription plans as displayed in the app. All payments are processed securely through our payment partners. Refunds may be issued at our discretion for technical failures or service disruptions. Wallet credits are non-transferable and have no cash value.',
    },
    {
      title: 'User Conduct',
      body: "You agree not to misuse our services or help anyone else do so. Prohibited behavior includes but is not limited to: harassment of astrologers, sharing false information, attempting to access other user accounts, using the service for illegal activities, or disrupting the platform's normal operations.",
    },
    {
      title: 'Intellectual Property',
      body: 'All content, features, and functionality of the Dhwani Astrologer application, including but not limited to text, graphics, logos, icons, and software, are the property of Dhwani Astrologer and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our permission.',
    },
    {
      title: 'Limitation of Liability',
      body: 'Dhwani Astrologer shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Astrological readings are for guidance purposes only and should not replace professional advice in areas such as medicine, law, or finance. We do not guarantee specific outcomes.',
    },
    {
      title: 'Termination',
      body: 'We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion. Upon termination, your right to use the service will immediately cease. Provisions that by their nature should survive termination shall remain in effect.',
    },
    {
      title: 'Changes to Terms',
      body: 'We may modify these Terms of Service at any time. We will notify you of material changes by posting the updated terms in the app and updating the "Last Revised" date. Your continued use of the service after such changes constitutes your acceptance of the revised terms.',
    },
  ];

  return (
 
    <ScrollView style={styles.container}>
      <Header title="Terms of Service" showBack onBackPress={()=>navigation.goBack()} />
       <View style={styles.headerContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '15' },
          ]}>
          <View style={[styles.docIcon, { borderColor: colors.primary }]}>
            <View
              style={[
                styles.docIconLine,
                { backgroundColor: colors.primary, top: 12, width: 16 },
              ]}
            />
            <View
              style={[
                styles.docIconLine,
                { backgroundColor: colors.primary, top: 20, width: 20 },
              ]}
            />
            <View
              style={[
                styles.docIconLine,
                { backgroundColor: colors.primary, top: 28, width: 14 },
              ]}
            />
          </View>
        </View>
        <AppText variant="h3" color={colors.text} style={styles.pageTitle}>
          Terms of Service
        </AppText>
        <AppText
          variant="body2"
          color={colors.textTertiary}
          style={styles.subtitle}>
          Last revised: April 2, 2026
        </AppText>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.introContainer}>
        <AppText
          variant="body1"
          color={colors.textSecondary}
          style={styles.introText}>
          Welcome to Dhwani Astrologer. These Terms of Service govern your use
          of our platform and services. Please read them carefully before using
          our application.
        </AppText>
      </View>

      {sections.map((section, index) => (
        <Section
          key={index}
          title={section.title}
          body={section.body}
          index={index + 1}
          colors={colors}
        />
      ))}

      <View
        style={[
          styles.footerContainer,
          { backgroundColor: colors.surfaceSecondary },
        ]}>
        <AppText
          variant="body2"
          color={colors.textSecondary}
          align="center"
          style={styles.footerText}>
          If you have any questions about these Terms of Service, please contact
          us at{' '}
          <AppText
            variant="body2"
            color={colors.primary}
            style={styles.footerLink}>
            support@dhwaniastro.com
          </AppText>
        </AppText>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:{
 flex:1,
  margin:20,
  marginTop:30
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  docIcon: {
    width: 36,
    height: 44,
    borderWidth: 2.5,
    borderRadius: 6,
    position: 'relative',
  },
  docIconLine: {
    position: 'absolute',
    left: 8,
    height: 3,
    borderRadius: 2,
  },
  pageTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  introContainer: {
    marginBottom: 24,
  },
  introText: {
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionBadgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontWeight: '600',
    flex: 1,
  },
  sectionBody: {
    lineHeight: 22,
    paddingLeft: 40,
  },
  footerContainer: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  footerText: {
    lineHeight: 22,
  },
  footerLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 40,
  },
});
