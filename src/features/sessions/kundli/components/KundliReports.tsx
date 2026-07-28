// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// const KundliReports = ({
//   ascendant,
//   details,
// }: any) => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.title}>
//           ✨ Ascendant Report
//         </Text>

//         <Text style={styles.subTitle}>
//           {ascendant?.asc_report
//             ?.ascendant}
//         </Text>

//         <Text style={styles.text}>
//           {
//             ascendant?.asc_report
//               ?.report
//           }
//         </Text>
//       </View>

//       {[
//         'physical',
//         'character',
//         'education',
//         'family',
//         'health',
//       ].map(section => (
//         <View
//           key={section}
//           style={styles.card}>
//           <Text
//             style={styles.sectionTitle}>
//             {section
//               .charAt(0)
//               .toUpperCase() +
//               section.slice(1)}
//           </Text>

//           {details?.[section]?.map(
//             (
//               item: string,
//               idx: number,
//             ) => (
//               <Text
//                 key={idx}
//                 style={styles.bullet}>
//                 • {item}
//               </Text>
//             ),
//           )}
//         </View>
//       ))}
//     </View>
//   );
// };

// export default KundliReports;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },

//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 18,
//     marginBottom: 16,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//   },

//   subTitle: {
//     color: '#F59E0B',
//     marginVertical: 10,
//     fontWeight: '700',
//   },

//   text: {
//     lineHeight: 24,
//     color: '#374151',
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//   },

//   bullet: {
//     lineHeight: 24,
//     marginBottom: 8,
//     color: '#4B5563',
//   },
// });


import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

const SECTION_CONFIG: any = {
    physical: {
        icon: '💪',
        title: 'Physical Traits',
    },
    character: {
        icon: '🧠',
        title: 'Character',
    },
    education: {
        icon: '🎓',
        title: 'Education & Career',
    },
    family: {
        icon: '👨‍👩‍👧‍👦',
        title: 'Family Life',
    },
    health: {
        icon: '❤️',
        title: 'Health',
    },
};

const KundliReports = ({
    ascendant,
    details,
}: any) => {
    const ascSign =
        ascendant?.asc_report?.ascendant;

    const report =
        ascendant?.asc_report?.report;

    return (
        <View style={styles.container}>
            {/* HERO REPORT CARD */}

            <View style={styles.heroCard}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>
                        Ascendant Analysis
                    </Text>
                </View>

                <Text style={styles.heroTitle}>
                    ✨ {ascSign}
                </Text>

                <Text style={styles.heroDescription}>
                    {report}
                </Text>
            </View>

            {/* REPORT SECTIONS */}

            {Object.keys(
                SECTION_CONFIG,
            ).map(section => {
                const config =
                    SECTION_CONFIG[section];

                const items =
                    details?.[section] || [];

                if (!items.length) {
                    return null;
                }

                return (
                    <View
                        key={section}
                        style={styles.sectionCard}>
                        {/* Header */}

                        <View
                            style={
                                styles.sectionHeader
                            }>
                            <Text
                                style={
                                    styles.sectionIcon
                                }>
                                {config.icon}
                            </Text>

                            <Text
                                style={
                                    styles.sectionTitle
                                }>
                                {config.title}
                            </Text>
                        </View>

                        {/* Content */}

                        {items.map(
                            (
                                item: string,
                                index: number,
                            ) => (
                                <View
                                    key={index}
                                    style={
                                        styles.pointCard
                                    }>
                                    <View
                                        style={
                                            styles.bulletDot
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.pointText
                                        }>
                                        {item}
                                    </Text>
                                </View>
                            ),
                        )}
                    </View>
                );
            })}
        </View>
    );
};

export default KundliReports;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },

    /* HERO */

    heroCard: {
        backgroundColor: '#FFF7ED',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,

        borderWidth: 1,
        borderColor: '#FED7AA',

        shadowColor: '#F59E0B',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },

    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },

    heroBadgeText: {
        color: '#B45309',
        fontWeight: '700',
        fontSize: 12,
    },

    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#7C2D12',
        marginBottom: 12,
    },

    heroDescription: {
        color: '#374151',
        lineHeight: 24,
        fontSize: 15,
    },

    /* SECTION */

    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        marginBottom: 18,

        borderWidth: 1,
        borderColor: '#F3F4F6',

        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFBEB',

        paddingHorizontal: 16,
        paddingVertical: 14,

        borderBottomWidth: 1,
        borderBottomColor: '#FEF3C7',
    },

    sectionIcon: {
        fontSize: 22,
        marginRight: 10,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#92400E',
    },

    /* POINTS */

    pointCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',

        paddingHorizontal: 16,
        paddingVertical: 14,

        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },

    bulletDot: {
        width: 8,
        height: 8,
        borderRadius: 4,

        backgroundColor: '#F59E0B',

        marginTop: 8,
        marginRight: 12,
    },

    pointText: {
        flex: 1,

        color: '#4B5563',
        lineHeight: 24,
        fontSize: 14.5,
    },
});

