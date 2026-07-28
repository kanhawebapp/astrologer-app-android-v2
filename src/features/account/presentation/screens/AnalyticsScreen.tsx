import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { AppText, Header } from '../../../../components';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const AnalytcsScreen: React.FC<any> = ({ route }) => {
    const { data } = route.params || {};
    const navigation = useNavigation()
    console.log("anannan", data)

    const monthlyData = data?.monthlyData || [];

    const labels = monthlyData.map((item: any) => item.month);

    const earningsData = monthlyData.map(
        (item: any) => Number(item.earnings) || 0,
    );

    const chatsData = monthlyData.map(
        (item: any) => Number(item.chats) || 0,
    );

    const callsData = monthlyData.map(
        (item: any) => Number(item.calls) || 0,
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {/* <AppText style={styles.heading}>Analytics Dashboard</AppText> */}
            <Header
                title="Analytics Dashboard"
                showBack
                onBackPress={() => navigation.goBack()}
            />
            {/* Summary Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <AppText style={styles.label}>Earnings</AppText>
                    <AppText style={styles.value}>
                        ₹{data?.totalEarnings || 0}
                    </AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.label}>Chats</AppText>
                    <AppText style={styles.value}>
                        {data?.totalChats || 0}
                    </AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.label}>Calls</AppText>
                    <AppText style={styles.value}>
                        {data?.totalCalls || 0}
                    </AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.label}>Followers</AppText>
                    <AppText style={styles.value}>
                        {data?.totalFollowers || 0}
                    </AppText>
                </View>

                <View style={styles.card}>
                    <AppText style={styles.label}>Rating</AppText>
                    <AppText style={styles.value}>
                        ⭐ {Number(data?.averageRating || 0).toFixed(2)}
                    </AppText>
                </View>
            </View>

            {/* Earnings Graph */}
            <AppText style={styles.chartTitle}>
                Monthly Earnings
            </AppText>

            <LineChart
                data={{
                    labels,
                    datasets: [
                        {
                            data:
                                earningsData.length > 0
                                    ? earningsData
                                    : [0],
                        },
                    ],
                }}
                width={screenWidth - 32}
                height={240}
                yAxisLabel="₹"
                bezier
                chartConfig={{
                    decimalPlaces: 0,
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: opacity => `rgba(33, 150, 243, ${opacity})`,
                    labelColor: opacity => `rgba(0,0,0,${opacity})`,
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                    },
                }}
                style={styles.chart}
            />

            {/* Chats vs Calls */}
            <AppText style={styles.chartTitle}>
                Monthly Chats & Calls
            </AppText>

            <BarChart
                data={{
                    labels,
                    datasets: [
                        {
                            data: chatsData.map(
                                (item: number, index: number) =>
                                    item + callsData[index],
                            ),
                        },
                    ],
                }}
                width={screenWidth - 32}
                height={240}
                fromZero
                chartConfig={{
                    decimalPlaces: 0,
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: opacity => `rgba(76, 175, 80, ${opacity})`,
                    labelColor: opacity => `rgba(0,0,0,${opacity})`,
                }}
                style={styles.chart}
            />

            {/* Monthly Breakdown */}
            {/* <AppText style={styles.chartTitle}>
                Monthly Breakdown
            </AppText>

            {monthlyData.map((item: any, index: number) => (
                <View key={index} style={styles.monthCard}>
                    <AppText style={styles.monthTitle}>
                        {item.month}
                    </AppText>

                    <AppText>💰 Earnings: ₹{item.earnings}</AppText>
                    <AppText>💬 Chats: {item.chats}</AppText>
                    <AppText>📞 Calls: {item.calls}</AppText>
                </View>
            ))} */}
        </ScrollView>
    );
};

export default AnalytcsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FC',
        paddingTop: 20
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        elevation: 2,
    },
    label: {
        fontSize: 13,
        color: '#777',
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 6,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
    },
    chart: {
        borderRadius: 16,
    },
    monthCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
});

