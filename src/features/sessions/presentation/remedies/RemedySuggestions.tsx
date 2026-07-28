import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from '../../../../components/common/AppText';

interface Props {
  title: string;
  onPress: () => void;
  colors: any;
}

const RemedySuggestions: React.FC<Props> = ({
  title,
  onPress,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor:
            colors.surfaceSecondary,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}>
      <Icon
        name="auto-fix-high"
        size={16}
        color={colors.primary}
      />

      <AppText
        numberOfLines={1}
        style={{
          flex: 1,
          marginLeft: 8,
          color: colors.text,
        }}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default RemedySuggestions;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
});