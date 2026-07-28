
// import React from 'react';
// import {
//   FlatList,
//   Text,
//   View,
//   StyleSheet,
// } from 'react-native';

// interface Props {
//   planets: any[];
// }

// const getPlanetEmoji = (
//   planet: string,
// ) => {
//   switch (planet?.toUpperCase()) {
//     case 'SUN':
//       return '☀️';
//     case 'MOON':
//       return '🌙';
//     case 'MARS':
//       return '♂️';
//     case 'MERCURY':
//       return '☿️';
//     case 'JUPITER':
//       return '♃';
//     case 'VENUS':
//       return '♀️';
//     case 'SATURN':
//       return '♄';
//     case 'RAHU':
//       return '☊';
//     case 'KETU':
//       return '☋';
//     case 'ASCENDANT':
//       return '⬆️';
//     default:
//       return '🪐';
//   }
// };

// const getAwasthaColor = (
//   awastha: string,
// ) => {
//   switch (awastha) {
//     case 'Yuva':
//       return '#4CAF50';

//     case 'Bala':
//       return '#2196F3';

//     case 'Vridha':
//       return '#FF9800';

//     case 'Mrit':
//       return '#F44336';

//     default:
//       return '#888';
//   }
// };

// const InfoRow = ({
//   label,
//   value,
// }: any) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.infoLabel}>
//       {label}
//     </Text>

//     <Text style={styles.infoValue}>
//       {value}
//     </Text>
//   </View>
// );

// const PlanetCard = ({
//   item,
// }: {
//   item: any;
// }) => {
//   const strength = Math.min(
//     100,
//     Math.round(
//       (item.normDegree / 30) * 100,
//     ),
//   );

//   const isRetro =
//     item.isRetro === true ||
//     item.isRetro === 'true';

//   return (
//     <View
//       style={[
//         styles.card,
//         isRetro &&
//         styles.retroCard,
//       ]}>
//       <View style={styles.header}>
//         <View
//           style={styles.leftSection}>
//           <View style={styles.orb}>
//             <Text
//               style={
//                 styles.orbEmoji
//               }>
//               {getPlanetEmoji(
//                 item.name,
//               )}
//             </Text>
//           </View>

//           <View>
//             <Text
//               style={
//                 styles.planetName
//               }>
//               {item.name}
//             </Text>

//             <View
//               style={
//                 styles.signBadge
//               }>
//               <Text
//                 style={
//                   styles.signText
//                 }>
//                 {item.sign}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 isRetro
//                   ? '#F44336'
//                   : '#16A34A',
//             },
//           ]}>
//           <Text
//             style={
//               styles.statusText
//             }>
//             {isRetro
//               ? 'RETRO'
//               : 'DIRECT'}
//           </Text>
//         </View>
//       </View>

//       <View
//         style={
//           styles.houseContainer
//         }>
//         <Text
//           style={styles.houseText}>
//           House {item.house}
//         </Text>
//       </View>

//       <Text
//         style={
//           styles.sectionTitle
//         }>
//         Planet Strength
//       </Text>

//       <View
//         style={
//           styles.strengthBar
//         }>
//         <View
//           style={[
//             styles.strengthFill,
//             {
//               width: `${strength}%`,
//             },
//           ]}
//         />
//       </View>

//       <Text
//         style={
//           styles.strengthValue
//         }>
//         {strength}% Strong
//       </Text>

//       <View
//         style={
//           styles.badgesRow
//         }>
//         <View
//           style={
//             styles.nakshatraBadge
//           }>
//           <Text
//             style={
//               styles.badgeText
//             }>
//             {item.nakshatra}
//           </Text>
//         </View>

//         <View
//           style={[
//             styles.nakshatraBadge,
//             {
//               backgroundColor:
//                 getAwasthaColor(
//                   item.planet_awastha,
//                 ),
//             },
//           ]}>
//           <Text
//             style={
//               styles.badgeText
//             }>
//             {item.planet_awastha}
//           </Text>
//         </View>
//       </View>

//       <View
//         style={
//           styles.detailsCard
//         }>
//         <InfoRow
//           label="Nakshatra Lord"
//           value={
//             item.nakshatraLord
//           }
//         />

//         <InfoRow
//           label="Sign Lord"
//           value={item.signLord}
//         />

//         <InfoRow
//           label="Pada"
//           value={
//             item.nakshatra_pad
//           }
//         />

//         <InfoRow
//           label="Degree"
//           value={`${item.normDegree?.toFixed(
//             2,
//           )}°`}
//         />

//         <InfoRow
//           label="Full Degree"
//           value={`${item.fullDegree?.toFixed(
//             2,
//           )}°`}
//         />

//         <InfoRow
//           label="Speed"
//           value={Number(
//             item.speed,
//           ).toFixed(2)}
//         />
//       </View>
//     </View>
//   );
// };

// const PlanetList = ({
//   planets,
// }: Props) => {
//   const retroCount =
//     planets.filter(
//       p =>
//         p.isRetro === true ||
//         p.isRetro === 'true',
//     ).length;

//   return (
//     <FlatList
//       data={planets}
//       keyExtractor={item =>
//         item.id.toString()
//       }
//       showsVerticalScrollIndicator={
//         false
//       }
//       contentContainerStyle={{
//         padding: 16,
//         paddingBottom: 120,
//       }}
//       ListHeaderComponent={
//         <View
//           style={
//             styles.summaryCard
//           }>
//           <Text
//             style={
//               styles.summaryTitle
//             }>
//             Planetary Overview
//           </Text>

//           <View
//             style={
//               styles.summaryRow
//             }>
//             <View
//               style={
//                 styles.summaryBox
//               }>
//               <Text
//                 style={
//                   styles.summaryValue
//                 }>
//                 {planets.length}
//               </Text>

//               <Text
//                 style={
//                   styles.summaryLabel
//                 }>
//                 Planets
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.summaryBox
//               }>
//               <Text
//                 style={
//                   styles.summaryValue
//                 }>
//                 {retroCount}
//               </Text>

//               <Text
//                 style={
//                   styles.summaryLabel
//                 }>
//                 Retro
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.summaryBox
//               }>
//               <Text
//                 style={
//                   styles.summaryValue
//                 }>
//                 {
//                   planets.filter(
//                     p =>
//                       p.house <=
//                       6,
//                   ).length
//                 }
//               </Text>

//               <Text
//                 style={
//                   styles.summaryLabel
//                 }>
//                 Active
//               </Text>
//             </View>
//           </View>
//         </View>
//       }
//       renderItem={({ item }) => (
//         <PlanetCard item={item} />
//       )}
//     />
//   );
// };

// export default PlanetList;

// const styles = StyleSheet.create({
//   summaryCard: {
//     backgroundColor: '#111827',
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//   },

//   summaryTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 18,
//   },

//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent:
//       'space-between',
//   },

//   summaryBox: {
//     alignItems: 'center',
//   },

//   summaryValue: {
//     color: '#D4AF37',
//     fontSize: 24,
//     fontWeight: '800',
//   },

//   summaryLabel: {
//     color: '#9CA3AF',
//     marginTop: 4,
//   },

//   card: {
//     backgroundColor: '#111827',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#1F2937',
//   },

//   retroCard: {
//     borderColor: '#D4AF37',
//   },

//   header: {
//     flexDirection: 'row',
//     justifyContent:
//       'space-between',
//     alignItems: 'center',
//   },

//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   orb: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor:
//       '#1F2937',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//   },

//   orbEmoji: {
//     fontSize: 28,
//   },

//   planetName: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   signBadge: {
//     marginTop: 6,
//     alignSelf: 'flex-start',
//     backgroundColor:
//       'rgba(212,175,55,0.15)',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },

//   signText: {
//     color: '#D4AF37',
//     fontWeight: '600',
//   },

//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },

//   statusText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 11,
//   },

//   houseContainer: {
//     marginTop: 16,
//     backgroundColor:
//       '#1F2937',
//     paddingVertical: 10,
//     borderRadius: 14,
//     alignItems: 'center',
//   },

//   houseText: {
//     color: '#fff',
//     fontWeight: '600',
//   },

//   sectionTitle: {
//     color: '#D1D5DB',
//     marginTop: 18,
//     marginBottom: 10,
//   },

//   strengthBar: {
//     height: 12,
//     backgroundColor:
//       '#374151',
//     borderRadius: 30,
//     overflow: 'hidden',
//   },

//   strengthFill: {
//     height: '100%',
//     backgroundColor:
//       '#D4AF37',
//   },

//   strengthValue: {
//     color: '#D4AF37',
//     marginTop: 8,
//     fontWeight: '700',
//   },

//   badgesRow: {
//     flexDirection: 'row',
//     marginTop: 16,
//   },

//   nakshatraBadge: {
//     backgroundColor:
//       '#2563EB',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//   },

//   badgeText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },

//   detailsCard: {
//     marginTop: 18,
//     backgroundColor:
//       '#1F2937',
//     borderRadius: 18,
//     padding: 14,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent:
//       'space-between',
//     paddingVertical: 8,
//   },

//   infoLabel: {
//     color: '#9CA3AF',
//   },

//   infoValue: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });



// import React from 'react';
// import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';

// const SIZE = Dimensions.get('window').width - 20;

// const KundliPremium = ({ planets = [] }) => {

//   const getHouseData = (house) =>
//     planets.filter(p => p.house === house);

//   const renderPlanetChip = (p, i) => (
//     <View key={i} style={styles.planetChip}>
//       <Text style={styles.planetName}>{p.name}</Text>
//       <Text style={styles.planetMeta}>
//         {p.sign} • {p.normDegree?.toFixed(1)}°
//       </Text>
//       <Text style={styles.planetMeta}>
//         {p.nakshatra} • {p.planet_awastha}
//       </Text>
//       {p.isRetro && (
//         <Text style={styles.retro}>℞ Retro</Text>
//       )}
//     </View>
//   );

//   const HouseBox = ({ house, style }) => {
//     const data = getHouseData(house);

//     return (
//       <View style={[styles.box, style]}>
//         <Text style={styles.houseLabel}>
//           House {house}
//         </Text>

//         {data.length === 0 ? (
//           <Text style={styles.empty}>—</Text>
//         ) : (
//           data.map(renderPlanetChip)
//         )}
//       </View>
//     );
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.chart}>

//         {/* OUTER RING - NORTH INDIAN STYLE */}

//         <HouseBox house={12} style={styles.h12} />
//         <HouseBox house={11} style={styles.h11} />
//         <HouseBox house={10} style={styles.h10} />

//         <HouseBox house={1} style={styles.h1} />
//         <HouseBox house={2} style={styles.h2} />
//         <HouseBox house={3} style={styles.h3} />

//         <HouseBox house={4} style={styles.h4} />
//         <HouseBox house={5} style={styles.h5} />
//         <HouseBox house={6} style={styles.h6} />

//         <HouseBox house={7} style={styles.h7} />
//         <HouseBox house={8} style={styles.h8} />
//         <HouseBox house={9} style={styles.h9} />

//         {/* CENTER LAGNA */}
//         <View style={styles.center}>
//           <Text style={styles.centerText}>
//             LAGNA
//           </Text>
//         </View>

//       </View>
//     </ScrollView>
//   );
// };

// export default KundliPremium;

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     backgroundColor: '#05070F',
//     alignItems: 'center',
//   },

//   chart: {
//     width: SIZE,
//     height: SIZE,
//     backgroundColor: '#0B1220',
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: '#2A3550',
//     position: 'relative',
//     overflow: 'hidden',
//   },

//   box: {
//     position: 'absolute',
//     width: SIZE / 3,
//     height: SIZE / 3,
//     borderWidth: 0.8,
//     borderColor: '#1F2A44',
//     padding: 6,
//   },

//   houseLabel: {
//     fontSize: 10,
//     color: '#8FA3C8',
//     marginBottom: 4,
//   },

//   empty: {
//     color: '#2A3550',
//     fontSize: 18,
//     textAlign: 'center',
//     marginTop: 20,
//   },

//   planetChip: {
//     backgroundColor: 'rgba(212,175,55,0.08)',
//     borderLeftWidth: 2,
//     borderLeftColor: '#D4AF37',
//     padding: 4,
//     marginBottom: 4,
//     borderRadius: 6,
//   },

//   planetName: {
//     color: '#D4AF37',
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   planetMeta: {
//     color: '#AAB4D6',
//     fontSize: 10,
//   },

//   retro: {
//     color: '#FF4D4D',
//     fontSize: 10,
//     fontWeight: '700',
//   },

//   center: {
//     position: 'absolute',
//     top: SIZE / 3,
//     left: SIZE / 3,
//     width: SIZE / 3,
//     height: SIZE / 3,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#D4AF37',
//     backgroundColor: '#0A0F1C',
//   },

//   centerText: {
//     color: '#D4AF37',
//     fontSize: 16,
//     fontWeight: '800',
//     letterSpacing: 2,
//   },

//   // GRID POSITIONING
//   h12: { top: 0, left: 0 },
//   h11: { top: 0, left: SIZE / 3 },
//   h10: { top: 0, left: (SIZE / 3) * 2 },

//   h1: { top: SIZE / 3, left: 0 },
//   h2: { top: SIZE / 3, left: SIZE / 3 },
//   h3: { top: SIZE / 3, left: (SIZE / 3) * 2 },

//   h4: { top: (SIZE / 3) * 2, left: 0 },
//   h5: { top: (SIZE / 3) * 2, left: SIZE / 3 },
//   h6: { top: (SIZE / 3) * 2, left: (SIZE / 3) * 2 },

//   h7: { top: (SIZE / 3) * 2, left: 0 },
//   h8: { top: (SIZE / 3) * 2, left: SIZE / 3 },
//   h9: { top: (SIZE / 3) * 2, left: (SIZE / 3) * 2 },
// });

// import React from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';

// interface Planet {
//   name: string;
//   sign: string;
//   degree: number;
//   house: number;
//   nakshatra: string;
//   isRetro?: boolean | string;
//   signLord?: string;
// }

// interface Props {
//   planets: Planet[];
// }

// const KundliTable = ({ planets = [] }: Props) => {
//   const renderRow = (item: Planet, index: number) => {
//     const isRetro = item.isRetro === true || item.isRetro === 'true';
//      console.log("planets data",planets)
//     return (
//       <View key={index} style={styles.row}>
//         <Text style={[styles.cell, styles.planet]}>
//           {item.name}
//         </Text>

//         <Text style={styles.cell}>{item.sign}</Text>

//         <Text style={styles.cell}>
//           {item.degree?.toFixed?.(2) ?? item.degree}
//         </Text>

//         <Text style={styles.cell}>{item.house}</Text>

//         <Text style={styles.cell}>{item.nakshatra}</Text>

//         <Text style={[styles.cell, isRetro && styles.retro]}>
//           {isRetro ? 'Yes' : 'No'}
//         </Text>

//         <Text style={styles.cell}>
//           {item.signLord || '-'}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* HEADER CARD */}
//       <View style={styles.titleBox}>
//         <Text style={styles.title}>🪔 Janam Kundli Report</Text>
//         <Text style={styles.subtitle}>
//           Planetary Position Table (Vedic Astrology)
//         </Text>
//       </View>

//       {/* TABLE HEADER */}
//       <View style={styles.headerRow}>
//         <Text style={styles.headerCell}>Planet</Text>
//         <Text style={styles.headerCell}>Sign</Text>
//         <Text style={styles.headerCell}>Deg</Text>
//         <Text style={styles.headerCell}>House</Text>
//         <Text style={styles.headerCell}>Nakshatra</Text>
//         <Text style={styles.headerCell}>Retro</Text>
//         <Text style={styles.headerCell}>Lord</Text>
//       </View>

//       {/* TABLE BODY */}
//       <View>
//         {planets.map(renderRow)}
//       </View>
//     </ScrollView>
//   );
// };

// export default KundliTable;
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#05070F',
//     padding: 12,
//   },

//   titleBox: {
//     backgroundColor: '#0B1220',
//     padding: 16,
//     borderRadius: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#1F2A44',
//   },

//   title: {
//     color: '#D4AF37',
//     fontSize: 18,
//     fontWeight: '800',
//   },

//   subtitle: {
//     color: '#8FA3C8',
//     marginTop: 4,
//     fontSize: 12,
//   },

//   headerRow: {
//     flexDirection: 'row',
//     backgroundColor: '#111827',
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#2A3550',
//   },

//   headerCell: {
//     flex: 1,
//     color: '#D4AF37',
//     fontSize: 11,
//     fontWeight: '700',
//     textAlign: 'center',
//   },

//   row: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#1F2A44',
//   },

//   cell: {
//     flex: 1,
//     color: '#E5E7EB',
//     fontSize: 11,
//     textAlign: 'center',
//   },

//   planet: {
//     color: '#FBBF24',
//     fontWeight: '700',
//   },

//   retro: {
//     color: '#EF4444',
//     fontWeight: '700',
//   },
// });


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface Planet {
  id: number;
  name: string;
  sign: string;
  house: number;
  normDegree: number;
  nakshatra: string;
  nakshatraLord: string;
  nakshatra_pad: number;
  signLord: string;
  planet_awastha: string;
  speed: number;
  isRetro: boolean | string;
}

interface Props {
  planets: Planet[];
}

const PLANET_ICONS: Record<string, string> = {
  SUN: '☀️',
  MOON: '🌙',
  MARS: '♂️',
  MERCURY: '☿️',
  JUPITER: '♃',
  VENUS: '♀️',
  SATURN: '♄',
  RAHU: '☊',
  KETU: '☋',
  URANUS: '♅',
  NEPTUNE: '♆',
  PLUTO: '♇',
  Ascendant: '⬆️',
};

const PlanetCard = ({ item }: { item: Planet }) => {
  const isRetro =
    item.isRetro === true ||
    item.isRetro === 'true';

  return (
    <View style={styles.card}>
      {/* Top Row */}

      <View style={styles.topRow}>
        <View style={styles.planetBox}>
          <Text style={styles.planetEmoji}>
            {PLANET_ICONS[item.name] || '🪐'}
          </Text>

          <View>
            <Text style={styles.planetName}>
              {item.name}
            </Text>

            <Text style={styles.sign}>
              {item.sign}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.retroBadge,
            isRetro && styles.retroActive,
          ]}>
          <Text
            style={[
              styles.retroText,
              isRetro && styles.retroTextActive,
            ]}>
            {isRetro ? 'Retrograde' : 'Direct'}
          </Text>
        </View>
      </View>

      {/* Main Stats */}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.label}>House</Text>
          <Text style={styles.value}>
            {item.house}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Degree</Text>
          <Text style={styles.value}>
            {item.normDegree?.toFixed(2)}°
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Pada</Text>
          <Text style={styles.value}>
            {item.nakshatra_pad}
          </Text>
        </View>
      </View>

      {/* Details */}

      <View style={styles.detailsContainer}>
        <Detail
          title="Nakshatra"
          value={item.nakshatra}
        />

        <Detail
          title="Nakshatra Lord"
          value={item.nakshatraLord}
        />

        <Detail
          title="Sign Lord"
          value={item.signLord}
        />

        <Detail
          title="Awastha"
          value={item.planet_awastha}
        />

        <Detail
          title="Speed"
          value={item.speed?.toFixed(3)}
        />
      </View>
    </View>
  );
};

const Detail = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>
      {title}
    </Text>

    <Text style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

const KundliTable = ({
  planets = [],
}: Props) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>
          🪔 Planetary Positions
        </Text>

        <Text style={styles.subtitle}>
          Complete Graha Placement Analysis
        </Text>
      </View>

      {planets.map(item => (
        <PlanetCard
          key={`${item.id}-${item.name}`}
          item={item}
        />
      ))}
    </ScrollView>
  );
};

export default KundliTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F1',
    padding: 16,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF8A00',
  },

  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE6C7',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  planetBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  planetEmoji: {
    fontSize: 28,
    marginRight: 12,
  },

  planetName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  sign: {
    color: '#FF8A00',
    marginTop: 2,
    fontWeight: '600',
  },

  retroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
  },

  retroActive: {
    backgroundColor: '#FEE2E2',
  },

  retroText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },

  retroTextActive: {
    color: '#DC2626',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 16,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
  },

  label: {
    color: '#6B7280',
    fontSize: 11,
  },

  value: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  detailItem: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  detailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  detailValue: {
    marginTop: 4,
    fontWeight: '700',
    color: '#111827',
    fontSize: 13,
  },
});
