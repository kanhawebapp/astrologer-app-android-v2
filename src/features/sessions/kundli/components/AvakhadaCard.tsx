import React from 'react';
import {
  View,
  Text,
} from 'react-native';

interface Props {
  data: any;
}

const AvakhadaCard = ({ data }: Props) => {
  if (!data) return null;

  return (
    <View>
      <Text>Ascendant: {data.ascendant}</Text>

      <Text>Sign: {data.sign}</Text>

      <Text>Nakshatra: {data.Naksahtra}</Text>

      <Text>Yog: {data.Yog}</Text>

      <Text>Tithi: {data.Tithi}</Text>

      <Text>Gan: {data.Gan}</Text>
    </View>
  );
};

export default AvakhadaCard;