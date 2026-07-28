

// import React, { useState } from 'react';
// import {
//     FlatList,
//     Text,
//     View,
//     TouchableOpacity,
//     StyleSheet,
//     Dimensions,
//     Animated,
// } from 'react-native';
// import { SvgXml } from 'react-native-svg';

// interface Props {
//     charts: any;
//     onSelect: (chart: any, name: string) => void;
// }

// const SCREEN_WIDTH = Dimensions.get('window').width;

// const ChartList = ({ charts, onSelect }: Props) => {
//     const chartArray = Object.entries(charts || {});
//     const [selected, setSelected] = useState<string | null>(null);

//     console.log("chartschartscharts",charts)

//     const handlePress = (name: string, chart: any) => {
//         setSelected(name);
//         onSelect(chart, name);
//     };

//     const renderItem = ({ item }: any) => {
//         const [name, chart] = item;

//         const cleanSvg = (svg: string) => {
//             if (!svg) return '';

//             return svg
//                 .replace(/\\"/g, '"')
//                 .replace(/\\n/g, '')
//                 .replace(/\\t/g, '')
//                 .replace(/\\r/g, '')
//                 .replace(/^"|"$/g, '')   // remove surrounding quotes
//                 .trim();
//         };

//         // const svgXml =
//         //     typeof chart === 'string'
//         //         ? chart
//         //         : chart?.svg || '';

//         // const svgXml =
//         //     cleanSvg(
//         //         typeof chart === 'string'
//         //             ? chart
//         //             : chart?.svg || ''
//         //     );
//         const svgXml = cleanSvg(
//             typeof chart === 'string'
//                 ? chart
//                 : chart?.svg || ''
//         );

//         const isSelected = selected === name;

//         return (
//             <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={() => handlePress(name, chart)}
//                 style={[
//                     styles.card,
//                     isSelected && styles.cardSelected,
//                 ]}
//             >
//                 {/* HEADER */}
//                 <View style={styles.header}>
//                     <Text style={styles.title}>{name}</Text>

//                     <View
//                         style={[
//                             styles.badge,
//                             isSelected && styles.badgeActive,
//                         ]}
//                     >
//                         <Text style={styles.badgeText}>
//                             {isSelected ? 'SELECTED' : 'VIEW'}
//                         </Text>
//                     </View>
//                 </View>

//                 {/* SVG PREVIEW */}
//                 <View style={styles.svgContainer}>
//                     {/* {svgXml ? (
//                         // <SvgXml
//                         //     xml={svgXml}
//                         //     width="100%"
//                         //     height="100%"
//                         // />
//                         <SvgXml xml={svgXml} width={320} height={320} />
//                     ) : (
//                         <Text style={styles.noSvg}>
//                             No chart available
//                         </Text>
//                     )} */}
//                     {svgXml ? (
//                         <SvgXml
//                             xml={svgXml}
//                             width={SCREEN_WIDTH - 60}
//                             height={260}
//                         />
//                     ) : (
//                         <Text style={styles.noSvg}>No chart available</Text>
//                     )}
//                 </View>

//                 {/* FOOTER */}
//                 <Text style={styles.footerText}>
//                     Tap to view full {name} chart
//                 </Text>
//             </TouchableOpacity>
//         );
//     };

//     return (
//         <FlatList
//             data={chartArray}
//             keyExtractor={([key]) => key}
//             renderItem={renderItem}
//             contentContainerStyle={styles.container}
//             showsVerticalScrollIndicator={false}
//         />
//     );
// };

// export default ChartList;

// const styles = StyleSheet.create({
//     container: {
//         padding: 14,
//         paddingBottom: 30,
//     },

//     card: {
//         // width: SCREEN_WIDTH - 28,
//         borderRadius: 18,
//         backgroundColor: '#0B0F1A',
//         marginBottom: 16,
//         padding: 14,

//         shadowColor: '#000',
//         shadowOpacity: 0.25,
//         shadowRadius: 10,
//         elevation: 6,
//         borderWidth: 1,
//         borderColor: '#1E2A44',
//     },

//     cardSelected: {
//         borderColor: '#7C5CFF',
//         shadowColor: '#7C5CFF',
//     },

//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 10,
//     },

//     title: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '700',
//         letterSpacing: 0.5,
//     },

//     badge: {
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 20,
//         backgroundColor: '#1C2436',
//     },

//     badgeActive: {
//         backgroundColor: '#7C5CFF',
//     },

//     badgeText: {
//         color: '#fff',
//         fontSize: 10,
//         fontWeight: '600',
//     },

//     svgContainer: {
//         width: '100%',
//         height: 260,
//         backgroundColor: '#0F1626',
//         borderRadius: 14,
//         overflow: 'hidden',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 8,
//     },

//     noSvg: {
//         color: '#888',
//         fontSize: 13,
//     },

//     footerText: {
//         marginTop: 10,
//         color: '#8FA3C8',
//         fontSize: 12,
//     },
// });


// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

// const SIZE = Dimensions.get('window').width - 20;

// const getHousePlanets = (planets: any[], house: number) => {
//     return planets.filter(p => Number(p.house) === house);

// };


// const PlanetText = ({ planets }: any) => {
//     if (!planets?.length) return null;

//     return (
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//             {planets.map((p: any, i: number) => (
//                 <Text key={i} style={styles.planet}>
//                     {p.name.slice(0, 2)}{' '}
//                 </Text>
//             ))}
//         </View>
//     );
// };

// const Box = ({ house, planets }: any) => {
//     return (
//         <View style={styles.box}>
//             <Text style={styles.house}>{house}</Text>
//             <PlanetText planets={getHousePlanets(planets, house)} />
//         </View>
//     );
// };

// const KundliChart = ({ planets = [] }: any) => {
//     const [tab, setTab] = useState<'D1' | 'D9'>('D1');

//     console.log("planetsplanets",planets)

//     return (
//         <View style={styles.container}>

//             {/* HEADER */}
//             <Text style={styles.title}>🪔 Divisional Kundli Chart</Text>

//             {/* TAB SWITCH */}
//             <View style={styles.tabRow}>
//                 <TouchableOpacity onPress={() => setTab('D1')}>
//                     <Text style={[styles.tab, tab === 'D1' && styles.activeTab]}>
//                         Lagna (D1)
//                     </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => setTab('D9')}>
//                     <Text style={[styles.tab, tab === 'D9' && styles.activeTab]}>
//                         Navamsa (D9)
//                     </Text>
//                 </TouchableOpacity>
//             </View>

//             {/* CHART GRID (NORTH INDIAN STYLE) */}
//             <View style={styles.chart}>

//                 {/* TOP ROW */}
//                 <View style={styles.row}>
//                     <Box house={12} planets={planets} />
//                     <Box house={11} planets={planets} />
//                     <Box house={10} planets={planets} />
//                 </View>

//                 {/* MIDDLE ROW */}
//                 <View style={styles.row}>
//                     <Box house={1} planets={planets} />
//                     <Box house={null} planets={[]} />
//                     <Box house={9} planets={planets} />
//                 </View>

//                 {/* CENTER */}
//                 <View style={styles.center}>
//                     <Text style={styles.centerText}>
//                         {tab === 'D1' ? 'LAGNA' : 'NAVAMSA'}
//                     </Text>
//                 </View>

//                 {/* LOWER MIDDLE */}
//                 <View style={styles.row}>
//                     <Box house={2} planets={planets} />
//                     <Box house={null} planets={[]} />
//                     <Box house={8} planets={planets} />
//                 </View>

//                 {/* BOTTOM ROW */}
//                 <View style={styles.row}>
//                     <Box house={3} planets={planets} />
//                     <Box house={4} planets={planets} />
//                     <Box house={5} planets={planets} />
//                 </View>

//             </View>
//         </View>
//     );
// };

// export default KundliChart;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#05070F',
//         padding: 10,
//     },

//     title: {
//         color: '#D4AF37',
//         fontSize: 18,
//         fontWeight: '800',
//         marginBottom: 10,
//         textAlign: 'center',
//     },

//     tabRow: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginBottom: 10,
//     },

//     tab: {
//         color: '#8FA3C8',
//         marginHorizontal: 10,
//         fontSize: 14,
//         paddingVertical: 6,
//         paddingHorizontal: 14,
//         borderRadius: 20,
//         backgroundColor: '#111827',
//     },

//     activeTab: {
//         color: '#000',
//         backgroundColor: '#D4AF37',
//         fontWeight: '800',
//     },

//     chart: {
//         width: SIZE,
//         height: SIZE,
//         backgroundColor: '#0B1220',
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: '#2A3550',
//         padding: 5,
//     },

//     row: {
//         flexDirection: 'row',
//         flex: 1,
//     },

//     box: {
//         flex: 1,
//         borderWidth: 0.5,
//         borderColor: '#1F2A44',
//         padding: 4,
//     },

//     house: {
//         fontSize: 10,
//         color: '#8FA3C8',
//     },

//     planet: {
//         color: '#D4AF37',
//         fontSize: 12,
//         fontWeight: '700',
//     },

//     center: {
//         position: 'absolute',
//         top: '40%',
//         left: '33%',
//         width: '34%',
//         height: '20%',
//         borderWidth: 2,
//         borderColor: '#D4AF37',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#0A0F1C',
//     },

//     centerText: {
//         color: '#D4AF37',
//         fontWeight: '900',
//     },
// });


import React, { useState } from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
    charts: any;
    onSelect?: (chart: any, name: string) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const ChartList = ({
    charts,
    onSelect,
}: Props) => {
    const [selected, setSelected] =
        useState<string | null>(null);

    const chartArray = Object.entries(
        charts || {},
    );

    const handlePress = (
        name: string,
        chart: any,
    ) => {
        setSelected(name);
        onSelect?.(chart, name);
    };

    const getSvg = (chart: any) => {
        let svg =
            typeof chart === 'string'
                ? chart
                : chart?.svg || '';

        return svg
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '')
            .replace(/\\r/g, '')
            .replace(/\\t/g, '')
            .trim();
    };

    const renderItem = ({ item }: any) => {
        const [name, chart] = item;

        // const svg = getSvg(chart);
        const svg = getSvg(chart)
            .replace(/stroke="black"/gi, 'stroke="#C28B37"')
            .replace(/fill="black"/gi, 'fill="#7C4D12"')
            .replace(/stroke:black/gi, 'stroke:#C28B37')
            .replace(/fill:black/gi, 'fill:#7C4D12');

        //     const html = `
        //   <!DOCTYPE html>
        //   <html>
        //   <head>
        //   <meta name="viewport" content="width=device-width, initial-scale=1"/>
        //   <style>
        //     body{
        //       margin:0;
        //       padding:0;
        //       display:flex;
        //       justify-content:center;
        //       align-items:center;
        //       background:white;
        //     }

        //     svg{
        //       width:100%;
        //       height:100%;
        //     }

        //     text{
        //       font-size:16px !important;
        //       font-weight:bold;
        //       fill:black !important;
        //     }
        //   </style>
        //   </head>

        //   <body>
        //     ${svg}
        //   </body>
        //   </html>`

        //         const html = `
        // <!DOCTYPE html>
        // <html>
        // <head>
        // <meta name="viewport" content="width=device-width, initial-scale=1"/>
        // <style>
        // html,body{
        //   margin:0;
        //   padding:0;
        //   width:100%;
        //   height:100%;
        //   background:#FFFFFF;
        //   display:flex;
        //   justify-content:center;
        //   align-items:center;
        // }

        // svg{
        //   width:100%;
        //   height:100%;
        // }

        // text{
        //   fill:#111827 !important;
        //   font-weight:700 !important;
        //   font-size:15px !important;
        // }
        // </style>
        // </head>

        // <body>
        // ${svg}
        // </body>
        // </html>
        // `;

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1"/>

<style>
html,body{
  margin:0;
  padding:0;
  width:100%;
  height:100%;
  background:#FFFDF8;
  display:flex;
  justify-content:center;
  align-items:center;
}

svg{
  width:100%;
  height:100%;
}

/* Kundli Lines */
path,
line,
polygon,
polyline,
rect,
circle{
  stroke:#C28B37 !important;
  stroke-width:1.5 !important;
}

/* Planet Names & House Numbers */
text{
  fill:#7C4D12 !important;
  font-size:15px !important;
  font-weight:700 !important;
}
</style>
</head>

<body>
${svg}
</body>
</html>
`;


        ;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                    handlePress(name, chart)
                }
                style={[
                    styles.card,
                    selected === name &&
                    styles.selectedCard,
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {name}
                    </Text>

                    <View
                        style={[
                            styles.badge,
                            selected === name &&
                            styles.activeBadge,
                        ]}
                    >
                        <Text style={styles.badgeText}>
                            {selected === name
                                ? 'SELECTED'
                                : 'VIEW'}
                        </Text>
                    </View>
                </View>

                <View style={styles.chartBox}>
                    <WebView
                        originWhitelist={['*']}
                        scrollEnabled={false}
                        source={{
                            html,
                        }}
                        style={{
                            flex: 1,
                            backgroundColor:
                                'transparent',
                        }}
                    />
                </View>

                <Text style={styles.footer}>
                    North Indian Kundli
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={chartArray}
            keyExtractor={([key]) => key}
            renderItem={renderItem}
            contentContainerStyle={{
                padding: 16,
            }}
            showsVerticalScrollIndicator={
                false
            }
        />
    );
};

export default ChartList;

// const styles = StyleSheet.create({
//     card: {
//         backgroundColor: '#111827',
//         borderRadius: 20,
//         padding: 16,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: '#1F2937',
//     },

//     selectedCard: {
//         borderColor: '#D4AF37',
//     },

//     header: {
//         flexDirection: 'row',
//         justifyContent:
//             'space-between',
//         alignItems: 'center',
//         marginBottom: 12,
//     },

//     title: {
//         color: '#fff',
//         fontSize: 18,
//         fontWeight: '700',
//     },

//     badge: {
//         backgroundColor: '#1F2937',
//         borderRadius: 20,
//         paddingHorizontal: 12,
//         paddingVertical: 5,
//     },

//     activeBadge: {
//         backgroundColor: '#D4AF37',
//     },

//     badgeText: {
//         color: '#fff',
//         fontWeight: '700',
//         fontSize: 11,
//     },

//     chartBox: {
//         height: 360,
//         borderRadius: 12,
//         overflow: 'hidden',
//         backgroundColor: '#fff',
//     },

//     footer: {
//         marginTop: 10,
//         color: '#9CA3AF',
//         textAlign: 'center',
//         fontSize: 12,
//     },
// });

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,

        borderWidth: 1,
        borderColor: '#F4E4BC',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    selectedCard: {
        borderColor: '#F59E0B',
        borderWidth: 2,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    title: {
        color: '#3F2D20',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    badge: {
        backgroundColor: '#FFF7ED',
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 6,

        borderWidth: 1,
        borderColor: '#FED7AA',
    },

    activeBadge: {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
    },

    badgeText: {
        color: '#92400E',
        fontWeight: '700',
        fontSize: 11,
    },

    chartBox: {
        height: 360,
        borderRadius: 18,
        overflow: 'hidden',

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    footer: {
        display: 'none',
    },
});

