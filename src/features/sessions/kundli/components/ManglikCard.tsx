// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// interface Props {
//   data: any;
// }

// const ManglikCard = ({
//   data,
// }: Props) => {
//   if (!data) return null;

//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>
//         🔱 Manglik Analysis
//       </Text>

//       <View
//         style={[
//           styles.badge,
//           {
//             backgroundColor:
//               data?.is_present
//                 ? '#FEF2F2'
//                 : '#ECFDF5',
//           },
//         ]}>
//         <Text
//           style={{
//             color: data?.is_present
//               ? '#DC2626'
//               : '#16A34A',
//             fontWeight: '700',
//           }}>
//           {data?.is_present
//             ? 'Manglik Present'
//             : 'Manglik Not Present'}
//         </Text>
//       </View>

//       <Text style={styles.report}>
//         {data?.manglik_report}
//       </Text>

//       <Info
//         label="Status"
//         value={data?.manglik_status}
//       />

//       <Info
//         label="Manglik %"
//         value={`${data?.percentage_manglik_present}%`}
//       />

//       <Info
//         label="After Cancellation"
//         value={`${data?.percentage_manglik_after_cancellation}%`}
//       />

//       {data?.manglik_cancel_rule?.map(
//         (
//           item: string,
//           index: number,
//         ) => (
//           <Text
//             key={index}
//             style={styles.rule}>
//             • {item}
//           </Text>
//         ),
//       )}
//     </View>
//   );
// };

// const Info = ({
//   label,
//   value,
// }: any) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.label}>
//       {label}
//     </Text>
//     <Text style={styles.value}>
//       {value}
//     </Text>
//   </View>
// );

// export default ManglikCard;

// const styles = StyleSheet.create({
//   card: {
//     margin: 16,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 18,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 14,
//   },

//   badge: {
//     padding: 10,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//     marginBottom: 12,
//   },

//   report: {
//     lineHeight: 22,
//     color: '#374151',
//     marginBottom: 16,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent:
//       'space-between',
//     marginBottom: 10,
//   },

//   label: {
//     color: '#6B7280',
//   },

//   value: {
//     fontWeight: '700',
//   },

//   rule: {
//     marginTop: 8,
//     color: '#4B5563',
//   },
// });


import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

interface Props {
    data: any;
}

const ManglikCard = ({
    data,
}: Props) => {
    if (!data) return null;

    const percentage =
        Number(
            data?.percentage_manglik_after_cancellation ||
            0,
        ) || 0;

    return (
        <View style={styles.container}>
            {/* HERO */}

            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <View>
                        <Text style={styles.heroTitle}>
                            🔱 Manglik Analysis
                        </Text>

                        <Text
                            style={
                                styles.heroSubtitle
                            }>
                            Marriage & Mars Dosha
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            data?.is_present
                                ? styles.presentBadge
                                : styles.notPresentBadge,
                        ]}>
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        data?.is_present
                                            ? '#DC2626'
                                            : '#16A34A',
                                },
                            ]}>
                            {data?.is_present
                                ? 'PRESENT'
                                : 'NOT PRESENT'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.report}>
                    {data?.manglik_report}
                </Text>
            </View>

            {/* STATS */}

            <View style={styles.statsRow}>
                <StatCard
                    title="Manglik %"
                    value={`${Number(
                        data?.percentage_manglik_present || 0,
                    ).toFixed(2)}%`}
                />

                <StatCard
                    title="After Cancellation"
                    value={`${Number(
                        data?.percentage_manglik_after_cancellation ||
                        0,
                    ).toFixed(2)}%`}
                />
            </View>

            {/* STATUS */}

            <View style={styles.statusCard}>
                <Text style={styles.sectionTitle}>
                    📊 Dosha Status
                </Text>

                <Text style={styles.statusValue}>
                    {data?.manglik_status ||
                        '-'}
                </Text>

                <View
                    style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(
                                    percentage,
                                    100,
                                )}%`,
                            },
                        ]}
                    />
                </View>

                <Text
                    style={
                        styles.progressText
                    }>
                    Effective Dosha Strength:{' '}
                    {percentage.toFixed(2)}%
                </Text>
            </View>

            {/* CANCELLATION */}

            <View style={styles.cancelCard}>
                <Text style={styles.sectionTitle}>
                    🛡️ Manglik Cancellation
                </Text>

                <View
                    style={[
                        styles.cancelBadge,
                        data?.is_mars_manglik_cancelled
                            ? styles.cancelled
                            : styles.notCancelled,
                    ]}>
                    <Text
                        style={[
                            styles.cancelText,
                            {
                                color:
                                    data?.is_mars_manglik_cancelled
                                        ? '#15803D'
                                        : '#DC2626',
                            },
                        ]}>
                        {data?.is_mars_manglik_cancelled
                            ? 'Manglik Dosha Cancelled'
                            : 'Cancellation Not Found'}
                    </Text>
                </View>

                {data?.manglik_cancel_rule?.map(
                    (
                        item: string,
                        index: number,
                    ) => (
                        <View
                            key={index}
                            style={
                                styles.ruleCard
                            }>
                            <View
                                style={
                                    styles.ruleDot
                                }
                            />

                            <Text
                                style={
                                    styles.ruleText
                                }>
                                {item}
                            </Text>
                        </View>
                    ),
                )}
            </View>
        </View>
    );
};

const StatCard = ({
    title,
    value,
}: any) => (
    <View style={styles.statCard}>
        <Text style={styles.statTitle}>
            {title}
        </Text>

        <Text style={styles.statValue}>
            {value}
        </Text>
    </View>
);

export default ManglikCard;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 30,
    },

    heroCard: {
        backgroundColor: '#FFF7ED',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,

        borderWidth: 1,
        borderColor: '#FED7AA',
    },

    heroTop: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#7C2D12',
    },

    heroSubtitle: {
        marginTop: 4,
        color: '#92400E',
    },

    statusBadge: {
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    presentBadge: {
        backgroundColor: '#FEE2E2',
    },

    notPresentBadge: {
        backgroundColor: '#DCFCE7',
    },

    statusText: {
        fontWeight: '800',
        fontSize: 11,
    },

    report: {
        color: '#44403C',
        lineHeight: 24,
        fontSize: 15,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },

    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    statTitle: {
        color: '#9CA3AF',
        fontSize: 12,
    },

    statValue: {
        marginTop: 8,
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },

    statusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        marginBottom: 16,

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 14,
    },

    statusValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F59E0B',
        marginBottom: 16,
    },

    progressTrack: {
        height: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 20,
    },

    progressText: {
        marginTop: 10,
        color: '#6B7280',
        fontSize: 13,
    },

    cancelCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    cancelBadge: {
        alignSelf: 'flex-start',
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },

    cancelled: {
        backgroundColor: '#DCFCE7',
    },

    notCancelled: {
        backgroundColor: '#FEE2E2',
    },

    cancelText: {
        fontWeight: '700',
        fontSize: 12,
    },

    ruleCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },

    ruleDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F59E0B',
        marginTop: 6,
        marginRight: 10,
    },

    ruleText: {
        flex: 1,
        color: '#4B5563',
        lineHeight: 22,
        fontSize: 14,
    },
});

