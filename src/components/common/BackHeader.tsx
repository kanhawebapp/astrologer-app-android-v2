import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from './AppText';
import { useTheme } from '../../hooks/useTheme';

interface BackHeaderProps {
  title: string;
}

export const BackHeader: React.FC<BackHeaderProps> = ({ title }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.headerBar]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <AppText variant="h5" color={colors.primary} style={styles.backButton}>
          {'\u2190'}
        </AppText>
      </TouchableOpacity>
      <AppText variant="h5" color={colors.text}>
        {title}
      </AppText>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    marginTop: Platform.OS === 'ios' ? 0 : 17,
  },
  backButton: {
    minWidth: 70,
    fontSize: 34,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10,
  },
  placeholder: {
    minWidth: 70,
  },
});
