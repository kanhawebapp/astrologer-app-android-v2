// import { useRoute } from '@react-navigation/native';
// import React, { useEffect, useState } from 'react'
// import { View, Text, ScrollView } from 'react-native'
// import { kundaliApi } from '../../../services/api/kundli/kundali.service';
// import UserInfoCard from '../kundli/components/UserInfoCard';
// import AvakhadaCard from '../kundli/components/AvakhadaCard';
// import PlanetList from '../kundli/components/PlanetList';
// import ChartList from '../kundli/components/ChartList';
// import ChartSvgView from '../kundli/components/ChartSvgView';

// const KundliScreen = () => {
//     const route = useRoute<any>();

//     const { session } = route.params;
//     const [loading, setLoading] = useState(true);
//     const [kundali, setKundali] = useState<any>(null);
//     const [selectedChart,
//         setSelectedChart] =
//         useState<any>(null);

//     const fetchKundali = async (chatId: string) => {
//         try {
//             setLoading(true);

//             const response = await kundaliApi.getKundali({
//                 requestSessionId: chatId,
//             });
//             const kundaliResponse =
//                 response?.getKundali?.data;
//             // console.log("alllll reesspos", kundaliResponse)

//             const parsedData = JSON.parse(
//                 kundaliResponse,
//             );

//             setKundali(parsedData);

//         } catch (error) {
//             console.log('Kundali Error', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {

//         fetchKundali(session?.chatId)
//     }, [])
//     console.log("kundalikundalikundalikundali", kundali)

//     useEffect(() => {
//         if (kundali) {
//             console.log(
//                 'USER DATA',
//                 kundali.user_data,
//             );

//             console.log(
//                 'PLANETS',
//                 kundali.PlanetsData,
//             );

//             console.log(
//                 'AVAKHADA',
//                 kundali.Avakhada,
//             );

//             console.log(
//                 'CHARTS',
//                 kundali.charts,
//             );
//         }
//     }, [kundali]);

//     return (
//         <ScrollView>

//             <UserInfoCard
//                 data={kundali?.user_data}
//             />

//             <AvakhadaCard
//                 data={kundali?.Avakhada}
//             />

//             <PlanetList
//                 planets={
//                     kundali?.PlanetsData || []
//                 }
//             />

//             <ChartList
//                 charts={kundali?.charts}
//                 onSelect={setSelectedChart}
//             />

//             {selectedChart?.svg && (
//                 <ChartSvgView
//                     svg={selectedChart.svg}
//                 />
//             )}

//         </ScrollView>
//     )
// }

// export default KundliScreen


import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

import { kundaliApi } from '../../../services/api/kundli/kundali.service';
import PlanetList from '../kundli/components/PlanetList';
import ChartList from '../kundli/components/ChartList';
import ChartSvgView from '../kundli/components/ChartSvgView';
import { Header } from '../../../components';
import UserAstroProfileCard from '../kundli/components/UserAstroProfileCard';
import ManglikCard from '../kundli/components/ManglikCard';
import KalsarpaCard from '../kundli/components/KalsarpaCard';
import DashaTimeline from '../kundli/components/DashaTimeline';
import KundliReports from '../kundli/components/KundliReports';

const TABS = [
    'Basic',
    'Planets',
    'Kundli',
    'Manglik',
    'Kalsarpa',
    'Dasha',
    'Reports',
];

const KundliScreen = () => {
    const route = useRoute<any>();
    const { session } = route.params;
    const navigation = useNavigation<any>()

    const [activeTab, setActiveTab] =
        useState('Basic');

    const [loading, setLoading] =
        useState(true);

    const [kundali, setKundali] =
        useState<any>(null);

    const [selectedChart, setSelectedChart] =
        useState<any>(null);

    const fetchKundali = async (
        chatId: string,
    ) => {
        try {
            setLoading(true);

            const response =
                await kundaliApi.getKundali({
                    requestSessionId: chatId,
                });

            const parsedData = JSON.parse(
                response?.getKundali?.data,
            );

            setKundali(parsedData);
        } catch (error) {
            console.log(
                'Kundali Error',
                error,
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.chatId) {
            fetchKundali(
                session.chatId,
            );
        }
    }, []);


    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator
                    size="large"
                />
                <Text>
                    Loading Kundli...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* TOP TABS */}
            {/* <Header title={'Kundli'} onBackPress={navigation.goBack()}/> */}
            {/* <View>
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Text>Back</Text>
                </TouchableOpacity>
                <Text>Kundli Details</Text>
            </View> */}
            <Header
                title="Kundli Details"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() =>
                                setActiveTab(
                                    tab,
                                )
                            }
                            style={[
                                styles.tab,
                                activeTab ===
                                tab &&
                                styles.activeTab,
                            ]}>
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab ===
                                    tab &&
                                    styles.activeTabText,
                                ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* CONTENT */}

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={
                    false
                }>
                {activeTab ===
                    'Basic' && (
                        <>
                            <UserAstroProfileCard
                                userData={kundali?.user_data}
                                avakhadaData={kundali?.Avakhada}
                                BirthData={kundali?.BirthData}

                            />
                        </>
                    )}

                {activeTab ===
                    'Planets' && (
                        <PlanetList
                            planets={
                                kundali?.PlanetsData ||
                                []
                            }
                        />
                    )}

                {activeTab ===
                    'Kundli' && (
                        <>
                            <ChartList
                                charts={
                                    kundali?.charts
                                }
                                onSelect={
                                    setSelectedChart
                                }
                            />

                            {selectedChart?.svg && (
                                <ChartSvgView
                                    svg={
                                        selectedChart.svg
                                    }
                                />
                            )}
                        </>
                    )}

                {/* {activeTab ===
                    'Manglik' && (
                        <View
                            style={
                                styles.placeholder
                            }>
                            <Text>
                                Manglik Data
                            </Text>
                        </View>
                    )}

                {activeTab ===
                    'Kalsarpa' && (
                        <View
                            style={
                                styles.placeholder
                            }>
                            <Text>
                                Kalsarpa Data
                            </Text>
                        </View>
                    )}

                {activeTab ===
                    'Dasha' && (
                        <View
                            style={
                                styles.placeholder
                            }>
                            <Text>
                                Dasha Data
                            </Text>
                        </View>
                    )}

                {activeTab ===
                    'Reports' && (
                        <View
                            style={
                                styles.placeholder
                            }>
                            <Text>
                                Reports Data
                            </Text>
                        </View>
                    )} */}

                {activeTab === 'Manglik' && (
                    <ManglikCard
                        data={kundali?.ManglikData}
                    />
                )}

                {activeTab === 'Kalsarpa' && (
                    <KalsarpaCard
                        data={kundali?.KalsarpaData}
                    />
                )}

                {activeTab === 'Dasha' && (
                    <DashaTimeline
                        dasha={kundali?.VimMahaDasha}
                    />
                )}

                {activeTab === 'Reports' && (
                    <KundliReports
                        ascendant={kundali?.AscendantData1}
                        details={kundali?.AscendantData2}
                    />
                )}


            </ScrollView>
        </View>
    );
};

export default KundliScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // padding: 20,
        marginTop: 30
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabsWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    tab: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        marginHorizontal: 4,
    },

    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#EF4444',
    },

    tabText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },

    activeTabText: {
        color: '#EF4444',
        fontWeight: '700',
    },

    content: {
        flex: 1,
        // padding: 16,
    },

    placeholder: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});
