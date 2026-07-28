import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText, Header } from '../../../../components';
import { bookedServicesApi } from '../../../../services/api/myServices/services.service';

const MyServices: React.FC = () => {
    const navigation = useNavigation();

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchBookedServices = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await bookedServicesApi.getBookedServices({
                page: 1,
                limit: 20,
            });

            console.log(
                'services response:',
                response?.getAstrologerAssignedBookedServices,
            );

            const services = response?.getAstrologerAssignedBookedServices;

            if (services?.success) {
                console.log('total:', services.total);
                console.log('current page:', services.currentPage);
                console.log('total pages:', services.totalPages);
                console.log('services:', services.data);

                setData(Array.isArray(services.data) ? services.data : []);
            } else {
                setData([]);
            }
        } catch (err) {
            console.log('booked services fetch error:', err);
            setError(err);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookedServices();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            <Header
                title="My Services"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {error ? (
                <View style={styles.center}>
                    <AppText>No Services Found.</AppText>
                </View>
            ) : data.length === 0 ? (
                <View style={styles.center}>
                    <AppText>No Services Found.</AppText>
                </View>
            ) : (
                data.map(service => (
                    <View key={service.id} style={styles.serviceCard}>
                        <AppText style={styles.serviceName}>
                            {service.name || 'N/A'}
                        </AppText>

                        <AppText>
                            Amount: ₹{service.amount ?? 0}
                        </AppText>

                        <AppText>
                            Payment Status: {service.paymentStatus || 'N/A'}
                        </AppText>

                        <AppText>
                            Booking Status: {service.bookingStatus || 'N/A'}
                        </AppText>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
    },
    contentContainer: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    serviceCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

export default MyServices;