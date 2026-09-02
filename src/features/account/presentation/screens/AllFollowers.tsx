
// import React, { useEffect } from 'react';
// import {
//     View,
//     Text,
//     FlatList,
//     ActivityIndicator,
//     StyleSheet,
//     Image,
//     RefreshControl,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useFollowers } from '../../../../services/api/followers/useFollowAstrologer';
// import { useTheme } from '../../../../hooks';
// import { Header } from '../../../../components';

// const AllFollowers = () => {
//     const route = useRoute<any>();
//     const navigation = useNavigation<any>();
//     const theme = useTheme();
//     const colors = theme.theme.colors;

//     const astrologerId = route?.params?.astrologerId;

//     const { followers, fetchFollowers, loading } = useFollowers();

//     useEffect(() => {
//         if (astrologerId) {
//             fetchFollowers(astrologerId);
//         }
//     }, [astrologerId]);

//     const onRefresh = async () => {
//         if (astrologerId) {
//             await fetchFollowers(astrologerId);
//         }
//     };

//     const renderItem = ({ item }: any) => {
//         return (
//             <View
//                 style={[
//                     styles.card,
//                     { backgroundColor: colors.background.secondary },
//                 ]}>

//                 {/* Avatar */}
//                 <View style={styles.avatar}>
//                     <Text style={styles.avatarText}>
//                         {item?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
//                     </Text>
//                 </View>

//                 {/* Info */}
//                 <View style={{ flex: 1 }}>
//                     <Text style={[styles.name, { color: colors.text.primary }]}>
//                         {item?.user?.name || 'Unknown User'}
//                     </Text>

//                     <Text style={[styles.subText]}>
//                         {item?.user?.countryCode} {item?.user?.mobile}
//                     </Text>
//                 </View>

//                 {/* Right icon */}
//                 {/* <Icon
//           name="chevron-forward"
//           size={18}
//           color={colors.text.secondary}
//           library="Ionicons"
//         /> */}
//             </View>
//         );
//     };

//     // LOADING STATE
//     if (loading && (!followers || followers.length === 0)) {
//         return (
//             <View style={styles.center}>
//                 <ActivityIndicator size="large" />
//                 <Text style={{ marginTop: 10, opacity: 0.6 }}>
//                     Loading followers...
//                 </Text>
//             </View>
//         );
//     }

//     return (
//         <View
//             style={[
//                 styles.container,
//                 { backgroundColor: colors.background.primary },
//             ]}>

//             {/* HEADER */}

//             <View style={styles.header}>
//                 <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
//                     Followers
//                 </Text>

//                 <Text style={[styles.headerCount]}>
//                     {followers?.length || 0} users
//                 </Text>
//             </View>

//             {/* LIST */}
//             <FlatList
//                 data={followers || []}
//                 keyExtractor={item => item?.id}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ padding: 16 }}
//                 refreshControl={
//                     <RefreshControl refreshing={loading} onRefresh={onRefresh} />
//                 }
//                 ListEmptyComponent={
//                     <View style={styles.empty}>
//                         <Text style={{ fontSize: 16, fontWeight: '600' }}>
//                             No followers yet
//                         </Text>
//                         <Text style={{ opacity: 0.6, marginTop: 4 }}>
//                             When people follow you, they will appear here
//                         </Text>
//                     </View>
//                 }
//             />
//         </View>
//     );
// };

// export default AllFollowers;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },

//     header: {
//         paddingHorizontal: 16,
//         paddingTop: 16,
//         paddingBottom: 10,
//     },

//     headerTitle: {
//         fontSize: 22,
//         fontWeight: '800',
//     },

//     headerCount: {
//         marginTop: 4,
//         fontSize: 13,
//         opacity: 0.6,
//     },

//     card: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 20,
//         // marginBottom: 10,
//         elevation: 10,
//         borderRadius: 14,
//     },

//     avatar: {
//         width: 42,
//         height: 42,
//         borderRadius: 21,
//         backgroundColor: '#6366f1',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },

//     avatarText: {
//         color: '#fff',
//         fontWeight: '800',
//         fontSize: 16,
//     },

//     name: {
//         fontSize: 15,
//         fontWeight: '700',
//     },

//     subText: {
//         fontSize: 12,
//         opacity: 0.6,
//         marginTop: 2,
//     },

//     center: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },

//     empty: {
//         marginTop: 80,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });

import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useFollowers } from '../../../../services/api/followers/useFollowAstrologer';
import { useTheme } from '../../../../hooks';
import { Header } from '../../../../components';

const AllFollowers = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const theme = useTheme();
    const colors = theme.theme.colors;

    const astrologerId = route?.params?.astrologerId;

    const { followers, fetchFollowers, loading } = useFollowers();

    useEffect(() => {
        if (astrologerId) {
            fetchFollowers(astrologerId);
        }
    }, [astrologerId]);

    const onRefresh = async () => {
        if (astrologerId) {
            await fetchFollowers(astrologerId);
        }
    };

    const renderItem = ({ item }: any) => {

        console.log('item', item);
        const joinedDate = item?.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
            : '';

        return (
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border?.light || '#EAEAEA',
                    },
                ]}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>

                    <View style={styles.onlineDot} />
                </View>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.name,
                            {
                                color: colors.text.primary,
                            },
                        ]}>
                        {item?.user?.name || 'Unknown User'}
                    </Text>

                    {/* <Text style={styles.mobileText}>
                        {item?.user?.countryCode} {item?.user?.mobile}
                    </Text> */}
                    <Text style={styles.mobileText}>
                        {item?.userId?.slice(-8) || 'N/A'}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                Follower
                            </Text>
                        </View>

                        <Text style={styles.joinedText}>
                            Joined {joinedDate}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && (!followers || followers.length === 0)) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>
                    Loading followers...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background.primary,
                },
            ]}>
            <Header
                title="Followers"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Followers Stats */}
            <View style={styles.statsContainer}>
                <View
                    style={[
                        styles.statsCard,
                        {
                            backgroundColor:
                                colors.background.secondary,
                        },
                    ]}>
                    <Text
                        style={[
                            styles.statsNumber,
                            {
                                color: colors.text.primary,
                            },
                        ]}>
                        {followers?.length || 0}
                    </Text>

                    <Text style={styles.statsLabel}>
                        Total Followers
                    </Text>
                </View>
            </View>

            <FlatList
                data={followers || []}
                keyExtractor={item => item?.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text
                            style={[
                                styles.emptyTitle,
                                {
                                    color: colors.text.primary,
                                },
                            ]}>
                            No Followers Yet
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            When users follow you, they will
                            appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default AllFollowers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    statsContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },

    statsCard: {
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        // elevation: 2,
    },

    statsNumber: {
        fontSize: 30,
        fontWeight: '800',
    },

    statsLabel: {
        marginTop: 4,
        fontSize: 13,
        opacity: 0.7,
        fontWeight: '500',
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',

        padding: 16,
        marginBottom: 12,

        borderRadius: 20,
        borderWidth: 1,

        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 112,
    },

    avatarContainer: {
        position: 'relative',
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,

        backgroundColor: '#6366F1',

        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },

    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,

        width: 14,
        height: 14,
        borderRadius: 7,

        backgroundColor: '#22C55E',

        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    infoContainer: {
        flex: 1,
        marginLeft: 14,
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
    },

    mobileText: {
        fontSize: 13,
        opacity: 0.65,
        marginTop: 3,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    badge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
    },

    badgeText: {
        color: '#4F46E5',
        fontSize: 11,
        fontWeight: '700',
    },

    joinedText: {
        marginLeft: 10,
        fontSize: 11,
        opacity: 0.55,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 12,
        opacity: 0.6,
    },

    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    emptySubtitle: {
        marginTop: 6,
        opacity: 0.6,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
});

