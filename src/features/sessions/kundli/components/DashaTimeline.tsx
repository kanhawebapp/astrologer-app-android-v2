// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// const DashaTimeline = ({
//   dasha,
// }: any) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>
//         🌙 Vimshottari Mahadasha
//       </Text>

//       {dasha?.map(
//         (item: any, index: number) => (
//           <View
//             key={index}
//             style={styles.row}>
//             <View style={styles.dot} />

//             <View style={styles.card}>
//               <Text
//                 style={styles.planet}>
//                 {item.planet}
//               </Text>

//               <Text
//                 style={styles.date}>
//                 {item.start}
//               </Text>

//               <Text
//                 style={styles.date}>
//                 {item.end}
//               </Text>
//             </View>
//           </View>
//         ),
//       )}
//     </View>
//   );
// };

// export default DashaTimeline;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     marginBottom: 20,
//   },

//   row: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },

//   dot: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: '#F59E0B',
//     marginTop: 10,
//     marginRight: 12,
//   },

//   card: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 14,
//   },

//   planet: {
//     fontWeight: '800',
//     fontSize: 16,
//   },

//   date: {
//     marginTop: 4,
//     color: '#6B7280',
//   },
// });

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const PLANET_META: Record<
  string,
  { icon: string; color: string }
> = {
  Sun: {
    icon: '☀️',
    color: '#F59E0B',
  },
  Moon: {
    icon: '🌙',
    color: '#60A5FA',
  },
  Mars: {
    icon: '♂️',
    color: '#EF4444',
  },
  Mercury: {
    icon: '☿',
    color: '#10B981',
  },
  Jupiter: {
    icon: '♃',
    color: '#F97316',
  },
  Venus: {
    icon: '♀',
    color: '#EC4899',
  },
  Saturn: {
    icon: '♄',
    color: '#6366F1',
  },
  Rahu: {
    icon: '☊',
    color: '#8B5CF6',
  },
  Ketu: {
    icon: '☋',
    color: '#A855F7',
  },
};

const DashaTimeline = ({
  dasha = [],
}: any) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>
          ✨ Vimshottari Mahadasha
        </Text>

        <Text style={styles.subtitle}>
          Planetary periods influencing
          different phases of life
        </Text>
      </View>

      {dasha?.map(
        (item: any, index: number) => {
          const meta =
            PLANET_META[item.planet] || {};

          const isCurrent =
            index === 0;

          return (
            <View
              key={index}
              style={styles.timelineRow}>
              {/* Timeline */}
              <View
                style={
                  styles.timelineWrapper
                }>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        meta.color ||
                        '#F59E0B',
                    },
                  ]}
                />

                {index !==
                  dasha.length -
                    1 && (
                  <View
                    style={
                      styles.line
                    }
                  />
                )}
              </View>

              {/* Card */}
              <View
                style={[
                  styles.card,
                  isCurrent &&
                    styles.activeCard,
                ]}>
                {/* Top Row */}
                <View
                  style={
                    styles.topRow
                  }>
                  <View
                    style={
                      styles.planetInfo
                    }>
                    <Text
                      style={
                        styles.icon
                      }>
                      {meta.icon ||
                        '🪐'}
                    </Text>

                    <View>
                      <Text
                        style={
                          styles.planet
                        }>
                        {
                          item.planet
                        }
                      </Text>

                      <Text
                        style={
                          styles.label
                        }>
                        Mahadasha
                      </Text>
                    </View>
                  </View>

                  {isCurrent && (
                    <View
                      style={
                        styles.currentBadge
                      }>
                      <Text
                        style={
                          styles.currentText
                        }>
                        CURRENT
                      </Text>
                    </View>
                  )}
                </View>

                {/* Dates */}
                <View
                  style={
                    styles.dateContainer
                  }>
                  <View
                    style={
                      styles.dateBox
                    }>
                    <Text
                      style={
                        styles.dateLabel
                      }>
                      Start
                    </Text>

                    <Text
                      style={
                        styles.dateValue
                      }>
                      {
                        item.start
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.dateBox
                    }>
                    <Text
                      style={
                        styles.dateLabel
                      }>
                      End
                    </Text>

                    <Text
                      style={
                        styles.dateValue
                      }>
                      {
                        item.end
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        },
      )}
    </View>
  );
};

export default DashaTimeline;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  headerCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7C2D12',
  },

  subtitle: {
    marginTop: 6,
    color: '#92400E',
    lineHeight: 20,
  },

  timelineRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  timelineWrapper: {
    alignItems: 'center',
    width: 30,
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#FCD34D',
    marginTop: 4,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginLeft: 10,

    borderWidth: 1,
    borderColor: '#F3F4F6',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  activeCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FFFDF8',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  planetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    fontSize: 28,
    marginRight: 12,
  },

  planet: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  label: {
    color: '#6B7280',
    marginTop: 2,
  },

  currentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },

  currentText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 11,
  },

  dateContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  dateBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 14,
  },

  dateLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  dateValue: {
    marginTop: 4,
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
  },
});
