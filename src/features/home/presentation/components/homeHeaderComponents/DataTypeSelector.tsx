import React from 'react';
import { View } from 'react-native';
import { FilterChip } from './FilterChip';

export const DataTypeSelector:React.FC<any> = ({
  data,
  scales,
  selected,
  onPress,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}>
      {data.map((item: { value: React.Key | null | undefined; label: string; icon: string | undefined; }, index: string | number) => (
        <FilterChip
          key={item.value}
          label={item.label}
          icon={item.icon}
          scale={scales[index]}
          selected={
            selected === item.value
          }
          onPress={() =>
            onPress(index, item.value)
          }
        />
      ))}
    </View>
  );
};