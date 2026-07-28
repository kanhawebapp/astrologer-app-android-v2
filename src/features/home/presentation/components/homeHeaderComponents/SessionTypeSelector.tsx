import React from 'react';
import {
  View,
  ScrollView,
} from 'react-native';

import { FilterChip } from './FilterChip';

export const SessionTypeSelector:React.FC<any> = ({
  data,
  scales,
  selected,
  onPress,
  theme,
}) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor:
          theme.colors.surfaceSecondary,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}>
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
      </ScrollView>
    </View>
  );
};
