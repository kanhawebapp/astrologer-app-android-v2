import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppText} from './AppText';
import {useTheme} from '../../hooks/useTheme';

interface GoBackProps {
  title: string;
  onBack: () => void;
}

export const GoBack: React.FC<GoBackProps> = ({title, onBack}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}>
        <Icon name="arrow-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <AppText variant="h5">{title}</AppText>
      <View style={styles.right} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
