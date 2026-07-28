import React from 'react';
import {
    View,
    ScrollView,
    Animated,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FilterChip } from './FilterChip';
import { AppText } from '../../../../../components';

export const PeriodSelector: React.FC<any> = ({
    periods,
    scales,
    selectedPeriod,
    onPress,
    customRange,
    theme,
}) => {
    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                }}>
                <Icon
                    name="calendar-clock"
                    size={16}
                    color={theme.colors.primary}
                />

                <AppText
                    variant="caption"
                    style={{
                        marginLeft: 6,
                        color: theme.colors.textSecondary,
                    }}>
                    Time Period
                </AppText>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}>
                {periods.map((item: { value: React.Key | null | undefined; label: string; icon: string | undefined; }, index: string | number) => (
                    <FilterChip
                        key={item.value}
                        label={item.label}
                        icon={item.icon}
                        scale={scales[index]}
                        selected={
                            selectedPeriod === item.value
                        }
                        onPress={() =>
                            onPress(index, item.value)
                        }
                    />
                ))}
            </ScrollView>

            {selectedPeriod === 'custom' &&
                customRange}
        </View>
    );
};