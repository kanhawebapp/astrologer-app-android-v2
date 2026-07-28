// import React from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// interface Props {
//   userData: any;
//   avakhadaData: any;
// }

// const UserAstroProfileCard = ({
//   userData,
//   avakhadaData,
// }: Props) => {
//   if (!userData && !avakhadaData) return null;

//   const InfoRow = ({
//     label,
//     value,
//   }: {
//     label: string;
//     value: string;
//   }) => (
//     <View style={styles.row}>
//       <Text style={styles.label}>{label}</Text>
//       <Text style={styles.value}>{value || '-'}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>
//         Birth & Astrology Profile
//       </Text>

//       {/* User Details */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>
//           Personal Information
//         </Text>

//         <InfoRow
//           label="Name"
//           value={userData?.name}
//         />

//         <InfoRow
//           label="Gender"
//           value={userData?.gender}
//         />

//         <InfoRow
//           label="Birth Place"
//           value={userData?.birthPlace}
//         />
//       </View>

//       {/* Divider */}
//       <View style={styles.divider} />

//       {/* Astrology Details */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>
//           Astrology Details
//         </Text>

//         <View style={styles.grid}>
//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Ascendant"
//               value={avakhadaData?.ascendant}
//             />
//           </View>

//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Sign"
//               value={avakhadaData?.sign}
//             />
//           </View>

//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Nakshatra"
//               value={avakhadaData?.Naksahtra}
//             />
//           </View>

//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Yog"
//               value={avakhadaData?.Yog}
//             />
//           </View>

//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Tithi"
//               value={avakhadaData?.Tithi}
//             />
//           </View>

//           <View style={styles.gridItem}>
//             <InfoRow
//               label="Gan"
//               value={avakhadaData?.Gan}
//             />
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default UserAstroProfileCard;

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 18,
//     marginHorizontal: 16,
//     marginVertical: 10,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 16,
//   },

//   section: {
//     marginTop: 4,
//   },

//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#F97316',
//     marginBottom: 12,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//   },

//   label: {
//     fontSize: 14,
//     color: '#6B7280',
//     flex: 1,
//   },

//   value: {
//     fontSize: 14,
//     color: '#111827',
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },

//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },

//   gridItem: {
//     width: '50%',
//   },
// });



// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
// } from 'react-native';

// interface Props {
//   userData: any;
//   avakhadaData: any;
//   BirthData:any;
// }

// const AstroItem = ({
//   title,
//   value,
// }: {
//   title: string;
//   value: string;
// }) => (
//   <View style={styles.astroItem}>
//     <Text style={styles.astroLabel}>{title}</Text>
//     <Text style={styles.astroValue}>
//       {value || '-'}
//     </Text>
//   </View>
// );

// const UserAstroProfileCard = ({
//   userData,
//   avakhadaData,
//   BirthData,
// }: Props) => {
//   if (!userData && !avakhadaData) return null;

//   console.log("check user data",userData)
//   console.log("check avakhadaData",avakhadaData)
//   console.log("check BirthData",BirthData)

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>
//             {userData?.name?.charAt(0)?.toUpperCase() || 'K'}
//           </Text>
//         </View>

//         <View style={styles.headerContent}>
//           <Text style={styles.name}>
//             {userData?.name || 'Unknown'}
//           </Text>

//           <Text style={styles.birthPlace}>
//             📍 {userData?.birthPlace || '-'}
//           </Text>

//           <View style={styles.genderBadge}>
//             <Text style={styles.genderText}>
//               {userData?.gender || '-'}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Astrology Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>
//           ✨ Astrology Profile
//         </Text>

//         <View style={styles.grid}>
//           <AstroItem
//             title="Ascendant"
//             value={avakhadaData?.ascendant}
//           />

//           <AstroItem
//             title="Moon Sign"
//             value={avakhadaData?.sign}
//           />

//           <AstroItem
//             title="Nakshatra"
//             value={avakhadaData?.Naksahtra}
//           />

//           <AstroItem
//             title="Yog"
//             value={avakhadaData?.Yog}
//           />

//           <AstroItem
//             title="Tithi"
//             value={avakhadaData?.Tithi}
//           />

//           <AstroItem
//             title="Gan"
//             value={avakhadaData?.Gan}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default UserAstroProfileCard;

// const styles = StyleSheet.create({
//   container: {
//     margin: 16,
//     borderRadius: 24,
//     backgroundColor: '#FFF',
//     overflow: 'hidden',

//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 6,
//   },

//   header: {
//     padding: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FF8A00',
//   },

//   avatar: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: 'rgba(255,255,255,0.25)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   avatarText: {
//     color: '#FFF',
//     fontSize: 28,
//     fontWeight: '700',
//   },

//   headerContent: {
//     flex: 1,
//     marginLeft: 16,
//   },

//   name: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#FFF',
//   },

//   birthPlace: {
//     marginTop: 4,
//     color: '#FFF',
//     fontSize: 14,
//     opacity: 0.95,
//   },

//   genderBadge: {
//     alignSelf: 'flex-start',
//     marginTop: 10,
//     backgroundColor: '#FFF',
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 30,
//   },

//   genderText: {
//     color: '#FF8A00',
//     fontWeight: '600',
//     fontSize: 12,
//   },

//   section: {
//     padding: 18,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 16,
//   },

//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },

//   astroItem: {
//     width: '48%',
//     backgroundColor: '#FFF7ED',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FED7AA',
//   },

//   astroLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginBottom: 6,
//   },

//   astroValue: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#111827',
//   },
// });


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface Props {
  userData: any;
  avakhadaData: any;
  BirthData: any;
}

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>
      {value !== undefined && value !== null && value !== ''
        ? value
        : '-'}
    </Text>
  </View>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.grid}>{children}</View>
  </View>
);

const UserAstroProfileCard = ({
  userData,
  avakhadaData,
  BirthData,
}: Props) => {
  if (!userData && !avakhadaData && !BirthData) {
    return null;
  }

  const dob = BirthData
    ? `${String(BirthData?.day).padStart(2, '0')}-${String(
        BirthData?.month,
      ).padStart(2, '0')}-${BirthData?.year}`
    : '-';

  const tob = BirthData
    ? `${String(BirthData?.hour).padStart(2, '0')}:${String(
        BirthData?.minute,
      ).padStart(2, '0')}`
    : '-';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.name}>
            {userData?.name || 'Unknown'}
          </Text>

          <Text style={styles.birthPlace}>
            📍 {userData?.birthPlace || '-'}
          </Text>

          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>
              {userData?.gender || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Birth Details */}
      <Section title="🌅 Birth Details">
        <InfoItem label="Date of Birth" value={dob} />
        <InfoItem label="Time of Birth" value={tob} />
        <InfoItem
          label="Sunrise"
          value={BirthData?.sunrise}
        />
        <InfoItem
          label="Sunset"
          value={BirthData?.sunset}
        />
        <InfoItem
          label="Latitude"
          value={BirthData?.latitude}
        />
        <InfoItem
          label="Longitude"
          value={BirthData?.longitude}
        />
        <InfoItem
          label="Timezone"
          value={BirthData?.timezone}
        />
        <InfoItem
          label="Ayanamsha"
          value={BirthData?.ayanamsha?.toFixed?.(2)}
        />
      </Section>

      {/* Panchang Details */}
      <Section title="🕉 Panchang Details">
        <InfoItem
          label="Tithi"
          value={avakhadaData?.Tithi}
        />
        <InfoItem
          label="Nakshatra"
          value={avakhadaData?.Naksahtra}
        />
        <InfoItem
          label="Charan"
          value={avakhadaData?.Charan}
        />
        <InfoItem
          label="Yoga"
          value={avakhadaData?.Yog}
        />
        <InfoItem
          label="Karan"
          value={avakhadaData?.Karan}
        />
        <InfoItem
          label="Nadi"
          value={avakhadaData?.Nadi}
        />
        <InfoItem
          label="Gan"
          value={avakhadaData?.Gan}
        />
        <InfoItem
          label="Yoni"
          value={avakhadaData?.Yoni}
        />
        <InfoItem
          label="Varna"
          value={avakhadaData?.Varna}
        />
        <InfoItem
          label="Vashya"
          value={avakhadaData?.Vashya}
        />
        <InfoItem
          label="Tatva"
          value={avakhadaData?.tatva}
        />
        <InfoItem
          label="Paya"
          value={avakhadaData?.paya}
        />
      </Section>

      {/* Additional Details */}
      <Section title="✨ Additional Details">
        <InfoItem
          label="Ascendant"
          value={avakhadaData?.ascendant}
        />
        <InfoItem
          label="Ascendant Lord"
          value={avakhadaData?.ascendant_lord}
        />
        <InfoItem
          label="Moon Sign"
          value={avakhadaData?.sign}
        />
        <InfoItem
          label="Sign Lord"
          value={avakhadaData?.SignLord}
        />
        <InfoItem
          label="Nakshatra Lord"
          value={avakhadaData?.NaksahtraLord}
        />
        <InfoItem
          label="Name Alphabet"
          value={avakhadaData?.name_alphabet}
        />
        <InfoItem
          label="Yunja"
          value={avakhadaData?.yunja}
        />
      </Section>
    </View>
  );
};

export default UserAstroProfileCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    backgroundColor: '#FF8A00',
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '800',
  },

  headerContent: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  birthPlace: {
    color: '#fff',
    marginTop: 6,
    fontSize: 14,
  },

  genderBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  genderText: {
    color: '#FF8A00',
    fontWeight: '700',
    fontSize: 12,
  },

  section: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoItem: {
    width: '48%',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
});

