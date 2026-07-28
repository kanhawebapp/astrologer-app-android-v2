// import React from 'react';
// import {
//   Modal,
//   Pressable,
//   View,
//   TouchableOpacity,
// } from 'react-native';

// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// export const CustomDateModal:React.FC<any> = ({
//   visible,
//   onClose,
//   theme,
//   quickRanges,
//   onQuickRange,
//   selectedRange,
//   onApply,
// }) => {
//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade">
//       <Pressable
//         style={{
//           flex: 1,
//           backgroundColor:
//             'rgba(0,0,0,0.5)',
//         }}
//         onPress={onClose}>
//         <Pressable
//           style={{
//             margin: 20,
//             padding: 20,
//             borderRadius: 20,
//             backgroundColor:
//               theme.colors.surface,
//           }}>
          
//           {/* Header */}

//           {/* Quick Ranges */}

//           {/* Selected Range */}

//           {/* Apply Button */}

//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// };


import React from 'react';
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../../../components';


interface QuickRange {
  label: string;
  days: number;
}

interface CustomDateModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  quickRanges: QuickRange[];
  onQuickRange: (days: number) => void;
  selectedRange: string;
  onApply: () => void;
}

export const CustomDateModal: React.FC<CustomDateModalProps> = ({
  visible,
  onClose,
  theme,
  quickRanges,
  onQuickRange,
  selectedRange,
  onApply,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        style={styles.overlay}
        onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}
          onPress={e => e.stopPropagation()}>
          
          {/* Header */}
          <View style={styles.header}>
            <AppText
              variant="body1"
              style={{
                color: theme.colors.text,
                fontWeight: '600',
              }}>
              Custom Date Range
            </AppText>

            <TouchableOpacity onPress={onClose}>
              <Icon
                name="close"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Select */}
          <AppText
            variant="caption"
            style={{
              color: theme.colors.textSecondary,
              marginBottom: 12,
            }}>
            Quick Select
          </AppText>

          <View style={styles.quickRangeContainer}>
            {quickRanges.map(range => (
              <TouchableOpacity
                key={range.days}
                activeOpacity={0.8}
                style={[
                  styles.quickRangeButton,
                  {
                    backgroundColor:
                      theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() =>
                  onQuickRange(range.days)
                }>
                <AppText
                  variant="caption"
                  style={{
                    color:
                      theme.colors.textSecondary,
                  }}>
                  {range.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Range */}
          <View
            style={[
              styles.selectedRangeContainer,
              {
                backgroundColor:
                  theme.colors.primary + '15',
              },
            ]}>
            <Icon
              name="calendar-range"
              size={18}
              color={theme.colors.primary}
            />

            <AppText
              variant="body2"
              style={{
                marginLeft: 8,
                color: theme.colors.primary,
                fontWeight: '600',
              }}>
              {selectedRange}
            </AppText>
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.applyButton,
              {
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
            onPress={onApply}>
            <Icon
              name="check-circle-outline"
              size={20}
              color={theme.colors.white}
            />

            <AppText
              variant="body2"
              style={{
                color: theme.colors.white,
                fontWeight: '600',
                marginLeft: 8,
              }}>
              Apply Range
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  container: {
    borderRadius: 20,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  quickRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickRangeButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  selectedRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
  },
});

