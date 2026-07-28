import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../../../components';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { offersApi } from '../../../../services/api/offer/offers.service';
import { offerStatusApi } from '../../../../services/api/offerStatus/offerStatus.service';
import { useToast } from '../../../../hooks/useToast';

interface Offer {
    id: string;
    offerName: string;
    price: number;
    description: string;
    isActive: boolean;
    selected: boolean;
    createdAt: string;
    updatedAt: string;
}

const OfferScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
    const { showWarning, showError, showSuccess } = useToast();

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await offersApi.getOffers();

            // console.log(
            //     'offers response:',
            //     JSON.stringify(response, null, 2),
            // );

            const offersData = response?.getOffers;

            if (offersData?.success) {
                setOffers(offersData.data || []);
            } else {
                setOffers([]);
            }
        } catch (error) {
            console.log('offers fetch error:', error);
            setOffers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOffers();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);


    const updateOfferStatus = async (
        offerId: string,
        isActive: boolean,
    ) => {
        try {
            setUpdatingOfferId(offerId);

            const response =
                await offerStatusApi.updateOfferStatus({
                    offerId,
                    isActive,
                });

            const result =
                response?.updateOfferStatus;

            if (result?.success) {
                await fetchOffers();
                showSuccess(result.message || 'Offer status updated successfully');

            } else {

                showError(result?.message || 'Failed to update offer');
            }
        } catch (error) {
            console.log(
                'offer status update error:',
                error,
            );

            showError('Unable to update offer');
        } finally {
            setUpdatingOfferId(null);
        }
    };

    // const handleOfferToggle = (
    //     currentOffer: Offer,
    //     newValue: boolean,
    // ) => {
    //     // OFF karna hai to directly allow
    //     if (!newValue) {
    //         updateOfferStatus(
    //             currentOffer.id,
    //             false,
    //         );
    //         return;
    //     }

    //     // // Koi aur offer already active hai?
    //     // const activeOffer = offers.find(
    //     //     offer =>
    //     //         offer.isActive &&
    //     //         offer.id !== currentOffer.id,
    //     // );
    //     const selectedOffer = offers.find(
    //         offer =>
    //             offer.selected &&
    //             offer.id !== currentOffer.id,
    //     );

    //     if (activeOffer) {
    //         showWarning(
    //             `"${activeOffer.offerName}" already active hai. Pehle us offer ko deactivate kijiye, phir naya offer activate kar sakte hain.`,
    //         );
    //         return;
    //     }

    //     // Activate allowed
    //     updateOfferStatus(
    //         currentOffer.id,
    //         true,
    //     );
    // };

    const handleOfferToggle = (
        currentOffer: Offer,
        newValue: boolean,
    ) => {
        // deactivate allow
        if (!newValue) {
            updateOfferStatus(
                currentOffer.id,
                false,
            );
            return;
        }

        // kisi aur offer par selected=true hai?
        const selectedOffer = offers.find(
            offer =>
                offer.selected &&
                offer.id !== currentOffer.id,
        );
        if (selectedOffer) {
            showWarning(
                `You already have an active offer ("${selectedOffer.offerName}"). Please deactivate it before selecting a new offer.`,
            );
            return;
        }

        // if (selectedOffer) {
        //     showWarning(
        //         `${selectedOffer.offerName} already selected hai. Pehle us offer ko deactivate kijiye, phir dusra offer activate kar sakte hain.`,
        //     );
        //     return;
        // }

        updateOfferStatus(
            currentOffer.id,
            true,
        );
    };

    const renderOffer = ({ item }: { item: Offer }) => (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <AppText
                        variant="h5"
                        style={{
                            color: colors.text,
                            marginBottom: 6,
                        }}>
                        {item.offerName}
                    </AppText>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: item.selected
                                    ? '#E8F8EE'
                                    : '#FFF0F0',
                            },
                        ]}>
                        <AppText
                            variant="caption"
                            style={{
                                color: item.selected
                                    ? '#22C55E'
                                    : '#EF4444',
                            }}>
                            {item.selected
                                ? 'Currently Selected'
                                : 'Inactive'}
                        </AppText>
                    </View>
                </View>

                <View
                    style={[
                        styles.priceContainer,
                        {
                            backgroundColor:
                                colors.primary + '15',
                        },
                    ]}>
                    <Icon
                        name="currency-inr"
                        size={18}
                        color={colors.primary}
                    />

                    <AppText
                        variant="h5"
                        style={{
                            color: colors.primary,
                            fontWeight: '700',
                        }}>
                        {item.price}
                    </AppText>
                </View>
            </View>

            <AppText
                variant="body2"
                style={{
                    color: colors.textSecondary,
                    marginTop: 12,
                }}>
                {item.description}
            </AppText>

            <View style={styles.bottomSection}>
                <View style={styles.footer}>
                    <Icon
                        name="calendar-month-outline"
                        size={16}
                        color={colors.textSecondary}
                    />

                    <AppText
                        variant="caption"
                        style={{
                            color: colors.textSecondary,
                            marginLeft: 6,
                        }}>
                        {new Date(
                            item.createdAt,
                        ).toLocaleDateString()}
                    </AppText>
                </View>

                {updatingOfferId === item.id ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.primary}
                    />
                ) : (
                    <Switch
                        value={item.selected}
                        // onValueChange={value =>
                        //     updateOfferStatus(
                        //         item.id,
                        //         value,
                        //     )
                        // }
                        onValueChange={value => {
                            handleOfferToggle(item, value);
                        }}
                        trackColor={{
                            false: '#D1D5DB',
                            true: colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                    />
                )}
            </View>
        </View>
    );

    const EmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Icon
                name="ticket-percent-outline"
                size={80}
                color={colors.textTertiary}
            />

            <AppText
                variant="h5"
                style={{
                    color: colors.text,
                    marginTop: 12,
                }}>
                No Offers Available
            </AppText>

            <AppText
                variant="body2"
                style={{
                    color: colors.textSecondary,
                    marginTop: 6,
                    textAlign: 'center',
                }}>
                Offers added by admin will appear here.
            </AppText>
        </View>
    );

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}>
            <Header
                title="Offers"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                    />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={item => item.id}
                    renderItem={renderOffer}
                    contentContainerStyle={{
                        padding: 16,
                        flexGrow: offers.length === 0 ? 1 : 0,
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            )}
        </View>
    );
};

export default OfferScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 4,
    },

    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
});

