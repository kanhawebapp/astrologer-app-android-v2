import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';

interface Props {
  remedies: any[];
  colors: any;
//   onActivate: (id: string) => void;
//   onDeactivate: (id: string) => void;
}

const ExistingRemedies: React.FC<Props> = ({
  remedies,
  colors,
//   onActivate,
//   onDeactivate,
}) => {
  if (!remedies?.length) return null;

  return (
    <View style={styles.container}>
      <AppText
        variant="body2"
        style={{
          color: colors.textSecondary,
          marginBottom: 12,
        }}>
        Available Remedies
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}>
        {remedies.map(item => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor:
                  colors.surfaceSecondary,
              },
            ]}>
            <AppText numberOfLines={1}>
              {item.title}
            </AppText>

            <TouchableOpacity
            //   onPress={() =>
            //     item.isActive
            //       ? onDeactivate(item.id)
            //       : onActivate(item.id)
            //   }
              >
              <Icon
                name={
                  item.isActive
                    ? 'toggle-on'
                    : 'toggle-off'
                }
                size={28}
                color={
                  item.isActive
                    ? colors.success
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ExistingRemedies;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  card: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
  },
});