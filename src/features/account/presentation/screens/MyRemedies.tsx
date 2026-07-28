import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { AppText, Header } from '../../../../components';
import { myRemediesApi } from '../../../../services/api/myRemedies/myRemedies.service';
import { useNavigation } from '@react-navigation/native';

const MyRemedies: React.FC = () => {
    const [data, setData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any>(null);

    const navigation = useNavigation();

    const fetchMyRemedies = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await myRemediesApi.getSessionRemedies({
                filter: {
                    page: 1,
                    limit: 10,
                },
            });

            // console.log(
            //     '=== GET SESSION REMEDIES RESPONSE ===',
            //     response?.getSessionRemedies,
            // );

            const remedies = response?.getSessionRemedies;

            if (remedies?.success) {

                setData(remedies.data || []);
            } else {
                setData([]);
            }
        } catch (err) {
            console.log('session remedies fetch error:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMyRemedies();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <AppText>Error loading remedies.</AppText>
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.center}>
                <AppText>No Remedies Found</AppText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title="My Remedies"
                showBack
                onBackPress={() => navigation.goBack()}
            />
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => (
                    <View style={styles.remedyCard}>
                        <AppText style={styles.title}>
                            Remedy #{index + 1}
                        </AppText>

                        <AppText style={styles.remedyText}>
                            {item.remedyText}
                        </AppText>

                        <AppText style={styles.date}>
                            {new Date(item.createdAt).toLocaleString()}
                        </AppText>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    remedyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
    },

    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },

    remedyText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },

    date: {
        marginTop: 12,
        fontSize: 12,
        color: '#888',
    },
});

export default MyRemedies;

