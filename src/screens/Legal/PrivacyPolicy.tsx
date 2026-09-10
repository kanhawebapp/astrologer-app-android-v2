import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../components/common/AppText';
import { BackgroundLayout } from '../../components/common/BackgroundLayout';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components';
import { useNavigation } from '@react-navigation/native';

interface SectionProps {
  title: string;
  icon: string;
  body: string;
  colors: Record<string, string>;
}

const Section: React.FC<SectionProps> = ({ title, icon, body, colors }) => (
  <View
    style={[styles.sectionCard, { backgroundColor: colors.surfaceSecondary }]}>
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIcon,
          { backgroundColor: colors.primary + '15' },
        ]}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
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

interface HighlightItemProps {
  label: string;
  value: string;
  colors: Record<string, string>;
}

const HighlightItem: React.FC<HighlightItemProps> = ({
  label,
  value,
  colors,
}) => (
  <View style={[styles.highlightItem, { borderColor: colors.border }]}>
    <AppText
      variant="caption"
      color={colors.textTertiary}
      style={styles.highlightLabel}>
      {label}
    </AppText>
    <AppText variant="body2" color={colors.text} style={styles.highlightValue}>
      {value}
    </AppText>
  </View>
);

export const PrivacyPolicy: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const sections = [
    {
      title: 'Information We Collect',
      icon: 'info-outline',
      body: 'We collect information you provide directly, including your name, phone number, email address, date of birth, and birth location for astrological calculations. We also collect consultation history, payment information, and device data to improve our services.',
    },
    {
      title: 'How We Use Your Data',
      icon: 'settings',
      body: 'Your data is used to provide personalized astrological consultations, process payments, send service notifications, improve our matching algorithms, and ensure platform security. We analyze usage patterns to enhance user experience while maintaining strict confidentiality.',
    },
    {
      title: 'Data Sharing & Disclosure',
      icon: 'lock-outline',
      body: 'We do not sell your personal information. Data may be shared with astrologers during consultations, payment processors for transactions, and analytics services in anonymized form. We may disclose information if required by law or to protect our rights and safety.',
    },
    {
      title: 'Data Security',
      icon: 'security',
      body: 'We implement industry-standard security measures including encryption, secure socket layer technology, and regular security audits. Your consultation data is encrypted end-to-end. Payment information is processed through PCI-compliant payment gateways and never stored on our servers.',
    },
    {
      title: 'Your Rights',
      icon: 'verified-user',
      body: 'You have the right to access, correct, or delete your personal data at any time through your account settings. You can request a copy of your data, withdraw consent for data processing, or request account deletion. We respond to all data requests within 30 days.',
    },
    {
      title: 'Data Retention',
      icon: 'schedule',
      body: 'We retain your account data as long as your account is active. Consultation records are kept for 2 years for quality assurance. After account deletion, residual data is removed within 90 days, except where retention is required by law. Payment records are maintained per regulatory requirements.',
    },
    {
      title: 'Cookies & Tracking',
      icon: 'cookie',
      body: 'We use cookies and similar technologies to maintain sessions, remember preferences, and analyze app usage. Third-party analytics tools may collect anonymized usage data. You can manage cookie preferences through your device settings, though disabling them may affect functionality.',
    },
    {
      title: "Children's Privacy",
      icon: 'child-care',
      body: 'Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover that a minor has provided us with personal data, we will delete it immediately. Parents or guardians can contact us to report any such collection.',
    },
  ];

  return (

    <ScrollView style={styles.container}>
      <Header title="Terms of Service"
        showBack
        onBackPress={() => navigation.goBack()}

      />

      <View style={styles.headerContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '15' },
          ]}>
          <MaterialIcons name="privacy-tip" size={32} color={colors.primary} />
        </View>
        <AppText variant="h3" color={colors.text} style={styles.pageTitle}>
          Privacy Policy
        </AppText>
        <AppText
          variant="body2"
          color={colors.textTertiary}
          style={styles.subtitle}>
          Last revised: April 2, 2026
        </AppText>
      </View>

      <View style={styles.introContainer}>
        <AppText
          variant="body1"
          color={colors.textSecondary}
          style={styles.introText}>
          At Dhwani Astrologer, we take your privacy seriously. This policy
          explains how we collect, use, and protect your personal information
          when you use our platform.
        </AppText>
      </View>

      <View style={styles.highlightsContainer}>
        <AppText
          variant="label"
          color={colors.text}
          style={styles.highlightsTitle}>
          At a Glance
        </AppText>
        <View style={styles.highlightsGrid}>
          <HighlightItem
            label="Data Encryption"
            value="AES-256"
            colors={colors}
          />
          <HighlightItem label="Data Selling" value="Never" colors={colors} />
          <HighlightItem
            label="Delete Request"
            value="30 Days"
            colors={colors}
          />
          <HighlightItem label="Retention" value="2 Years" colors={colors} />
        </View>
      </View>

      {sections.map((section, index) => (
        <Section
          key={index}
          title={section.title}
          icon={section.icon}
          body={section.body}
          colors={colors}
        />
      ))}

      <View
        style={[
          styles.contactCard,
          {
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '30',
          },
        ]}>
        <View style={styles.contactHeader}>
          <MaterialIcons name="email" size={20} color={colors.primary} />
          <AppText variant="h5" color={colors.text} style={styles.contactTitle}>
            Contact Us
          </AppText>
        </View>
        <AppText
          variant="body2"
          color={colors.textSecondary}
          style={styles.contactBody}>
          For privacy-related inquiries, data requests, or concerns, please
          reach out to our Data Protection Officer:
        </AppText>
        <View style={styles.contactItem}>
          <AppText
            variant="body2"
            color={colors.primary}
            style={styles.contactLink}>
            privacy@DhwaniPartner.com
          </AppText>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    marginTop: 30
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
  pageTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 16,
  },
  introContainer: {
    marginBottom: 24,
  },
  introText: {
    lineHeight: 24,
  },
  highlightsContainer: {
    marginBottom: 28,
  },
  highlightsTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  highlightItem: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  highlightLabel: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  highlightValue: {
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontWeight: '600',
    flex: 1,
  },
  sectionBody: {
    lineHeight: 22,
    paddingLeft: 48,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactTitle: {
    fontWeight: '600',
  },
  contactBody: {
    lineHeight: 22,
    marginBottom: 12,
  },
  contactItem: {
    marginTop: 4,
  },
  contactLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 40,
  },
});
