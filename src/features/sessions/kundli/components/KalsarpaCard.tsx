// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// const KalsarpaCard = ({
//   data,
// }: any) => {
//   if (!data) return null;

//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>
//         🐍 Kaal Sarp Dosha
//       </Text>

//       <Text style={styles.name}>
//         {data?.name}
//       </Text>

//       <Text style={styles.type}>
//         {data?.type}
//       </Text>

//       <View style={styles.status}>
//         <Text
//           style={{
//             color: data?.present
//               ? '#DC2626'
//               : '#16A34A',
//             fontWeight: '700',
//           }}>
//           {data?.present
//             ? 'Present'
//             : 'Not Present'}
//         </Text>
//       </View>

//       <Text style={styles.oneLine}>
//         {data?.one_line}
//       </Text>

//       <Text style={styles.report}>
//         {data?.report?.report
//           ?.replace(/<[^>]*>/g, '')
//           ?.trim()}
//       </Text>
//     </View>
//   );
// };

// export default KalsarpaCard;

// const styles = StyleSheet.create({
//   card: {
//     margin: 16,
//     padding: 18,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//   },

//   name: {
//     marginTop: 12,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#F59E0B',
//   },

//   type: {
//     color: '#6B7280',
//     marginBottom: 12,
//   },

//   status: {
//     marginBottom: 12,
//   },

//   oneLine: {
//     fontWeight: '600',
//     marginBottom: 12,
//   },

//   report: {
//     color: '#374151',
//     lineHeight: 24,
//   },
// });

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';

const KalsarpaCard = ({
    data,
}: any) => {
    if (!data) return null;

    const reportText =
        data?.report?.report
            ?.replace(/<[^>]*>/g, '')
            ?.replace(/\n+/g, '\n')
            ?.trim() || '';

    const paragraphs = reportText
        .split('.')
        .filter(
            (item: string) =>
                item.trim().length > 15,
        );

    return (
        <ScrollView
            showsVerticalScrollIndicator={
                false
            }
            contentContainerStyle={
                styles.container
            }>
            {/* HERO CARD */}

            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <Text style={styles.heroEmoji}>
                        🐍
                    </Text>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.heroTitle}>
                            Kaal Sarp Dosha
                        </Text>

                        <Text
                            style={
                                styles.heroSubtitle
                            }>
                            Vedic Dosha Analysis
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            data?.present
                                ? styles.presentBadge
                                : styles.notPresentBadge,
                        ]}>
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        data?.present
                                            ? '#DC2626'
                                            : '#16A34A',
                                },
                            ]}>
                            {data?.present
                                ? 'PRESENT'
                                : 'NOT PRESENT'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.doshaName}>
                    {data?.name}
                </Text>

                <Text style={styles.doshaType}>
                    {data?.type}
                </Text>
            </View>

            {/* QUICK INFO */}

            <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>
                        Dosha Name
                    </Text>

                    <Text style={styles.infoValue}>
                        {data?.name || '-'}
                    </Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>
                        House
                    </Text>

                    <Text style={styles.infoValue}>
                        {data?.report?.house_id ||
                            '-'}
                    </Text>
                </View>
            </View>

            {/* SUMMARY */}

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                    ✨ Summary
                </Text>

                <Text
                    style={
                        styles.summaryText
                    }>
                    {data?.one_line}
                </Text>
            </View>

            {/* REPORT */}

            <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>
                    📜 Detailed Analysis
                </Text>

                {paragraphs.map(
                    (
                        paragraph: string,
                        index: number,
                    ) => (
                        <View
                            key={index}
                            style={
                                styles.pointCard
                            }>
                            <View
                                style={
                                    styles.pointDot
                                }
                            />

                            <Text
                                style={
                                    styles.pointText
                                }>
                                {paragraph.trim()}.
                            </Text>
                        </View>
                    ),
                )}
            </View>
        </ScrollView>
    );
};

export default KalsarpaCard;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },

    heroCard: {
        backgroundColor: '#FFF7ED',
        borderRadius: 24,
        padding: 20,
        marginBottom: 18,

        borderWidth: 1,
        borderColor: '#FED7AA',
    },

    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    heroEmoji: {
        fontSize: 34,
        marginRight: 12,
    },

    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#7C2D12',
    },

    heroSubtitle: {
        color: '#92400E',
        marginTop: 2,
    },

    doshaName: {
        marginTop: 18,
        fontSize: 24,
        fontWeight: '800',
        color: '#F59E0B',
    },

    doshaType: {
        marginTop: 4,
        color: '#6B7280',
        fontSize: 15,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 30,
    },

    presentBadge: {
        backgroundColor: '#FEE2E2',
    },

    notPresentBadge: {
        backgroundColor: '#DCFCE7',
    },

    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },

    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 18,
    },

    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    infoLabel: {
        color: '#9CA3AF',
        fontSize: 12,
    },

    infoValue: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },

    summaryCard: {
        backgroundColor: '#FEFCE8',
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,

        borderWidth: 1,
        borderColor: '#FEF08A',
    },

    summaryTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#854D0E',
        marginBottom: 10,
    },

    summaryText: {
        color: '#44403C',
        lineHeight: 24,
        fontSize: 15,
    },

    reportCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    reportTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 18,
        color: '#111827',
    },

    pointCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },

    pointDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F59E0B',
        marginTop: 7,
        marginRight: 12,
    },

    pointText: {
        flex: 1,
        color: '#4B5563',
        lineHeight: 24,
        fontSize: 15,
    },
});
