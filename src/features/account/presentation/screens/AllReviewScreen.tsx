import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../../../components/layout/Header';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { AppText } from '../../../../components/common/AppText';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useTheme } from '../../../../hooks/useTheme';
import { reviewsApi } from '../../../../services/api/getReview/reviews.service';
import { AstrologerReview } from '../../../../services/api/getReview/reviews.types';
import { reviewReplyApi } from '../../../../services/api/replyReview/reviewReply.service';
import { ReviewReplyModal } from './ReviewReplyModal';
import { useToast } from '../../../../hooks/useToast';


export const AllReviewScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviews, setReviews] = useState<AstrologerReview[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const { showError, showSuccess, showWarning } = useToast();


    const [selectedReview, setSelectedReview] =
        useState<AstrologerReview | null>(null);

    const [replyModalVisible, setReplyModalVisible] =
        useState(false);

    const [replyLoading, setReplyLoading] =
        useState(false);

    const openReplyModal = (
        review: AstrologerReview,
    ) => {
        setSelectedReview(review);
        setReplyModalVisible(true);
    };

    const closeReplyModal = () => {
        setReplyModalVisible(false);
        setSelectedReview(null);
    };


    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);

            const response =
                await reviewsApi.getAstrologerReviews({
                    page: 1,
                    limit: 100,
                });

            // console.log(
            //     'reviews response heree',
            //     JSON.stringify(response, null, 2),
            // );

            const reviewsResponse =
                response?.getAstrologerReviews ||
                response?.data?.getAstrologerReviews;

            if (reviewsResponse?.success) {
                const reviewList =
                    reviewsResponse?.data || [];

                setReviews(reviewList);

                if (reviewList.length > 0) {
                    const total = reviewList.reduce(
                        (
                            sum: number,
                            item: AstrologerReview,
                        ) => sum + item.rating,
                        0,
                    );

                    setAverageRating(
                        Number(
                            (
                                total / reviewList.length
                            ).toFixed(1),
                        ),
                    );
                } else {
                    setAverageRating(0);
                }
            }
        } catch (error) {
            console.log(
                'reviews fetch error:',
                error,
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    React.useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReviews();
    }, [fetchReviews]);

    const ratingCounts = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[r.rating - 1] += 1;
            }
        });
        return counts.reverse();
    }, [reviews]);

    const renderStars = (rating: number, size: number = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={size}
                    color={i <= rating ? theme.colors.accentGold : theme.colors.textTertiary}
                />,
            );
        }
        return stars;
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getSessionTypeLabel = (type: string) => {
        switch (type) {
            case 'CHAT':
                return 'Chat';
            case 'CALL':
                return 'Call';
            case 'VIDEO':
                return 'Video';
            default:
                return type;
        }
    };

    const submitReply = async (
        replyText: string,
    ) => {
        if (!selectedReview?.id) {
            return;
        }

        try {
            setReplyLoading(true);

            const response =
                await reviewReplyApi.replyToReview({
                    reviewId: selectedReview.id,
                    reply: replyText,
                });

            console.log(
                'reply response',
                JSON.stringify(
                    response,
                    null,
                    2,
                ),
            );

            const result =
                response?.data?.replyToReview;

            if (result?.success) {
                // Alert.alert(
                //     'Success',
                //     result.message ||
                //     'Reply submitted successfully',
                // );
                showSuccess('Reply submitted successfully', 'Reply Sent');

                closeReplyModal();

                fetchReviews();
            }
        } catch (error: any) {
            console.log(
                'reply error',
                error,
            );
            showError(error || 'Failed to submit reply');
            // Alert.alert(
            //     'Error',
            //     'Failed to submit reply',
            // );
        } finally {
            setReplyLoading(false);
            setReplyModalVisible(false)
            fetchReviews();
        }
    };

    const formatSessionId = (sessionId: string | number) => {
        return String(sessionId).slice(-8).padStart(8, '0');
    };

    return (
        <ScreenContainer scrollable={false} withPadding={false}>
            <Header
                title="Reviews"
                showBack
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={[styles.summarySection, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.summaryHeader}>
                                <View style={styles.summaryTitleRow}>
                                    <Icon name="star" size={24} color={theme.colors.accentGold} />
                                    <AppText variant="h4" color={theme.colors.text} style={styles.averageRating}>
                                        {averageRating.toFixed(1)}
                                    </AppText>
                                    <View style={styles.starsRow}>{renderStars(Math.round(averageRating), 18)}</View>
                                    <AppText variant="caption" color={theme.colors.textSecondary}>
                                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                                    </AppText>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                            <View style={styles.ratingBreakdown}>
                                {[5, 4, 3, 2, 1].map((star, idx) => {
                                    const count = ratingCounts[idx];
                                    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                    return (
                                        <View key={star} style={styles.ratingRow}>
                                            <AppText variant="body2" color={theme.colors.text} style={styles.ratingLabel}>
                                                {star}
                                            </AppText>
                                            <Icon name="star" size={14} color={theme.colors.accentGold} />
                                            <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { backgroundColor: theme.colors.accentGold, width: `${percentage}%` },
                                                    ]}
                                                />
                                            </View>
                                            <AppText variant="caption" color={theme.colors.textTertiary} style={{ minWidth: 28 }}>
                                                {count}
                                            </AppText>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {reviews.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
                                    <Icon name="chatbubble-ellipses-outline" size={48} color={theme.colors.textTertiary} />
                                </View>
                                <AppText variant="h5" color={theme.colors.text} style={styles.emptyTitle}>
                                    No Reviews Yet
                                </AppText>
                                <AppText variant="body2" color={theme.colors.textSecondary} style={styles.emptySubtitle}>
                                    When clients complete sessions and leave reviews, they'll appear here.
                                </AppText>
                            </View>
                        ) : (
                            <View style={styles.reviewsList}>
                                {reviews.map((review) => (
                                    // <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
                                    <TouchableOpacity
                                        key={review.id}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (review.reply) {
                                                showWarning('Reply already submitted', 'You have already replied to this review.');
                                                // Alert.alert(
                                                //     'Reply Already Submitted',
                                                //     'You have already replied to this review.',
                                                // );
                                                return;
                                            }

                                            openReplyModal(review);
                                        }}
                                        style={[
                                            styles.reviewCard,
                                            {
                                                backgroundColor:
                                                    theme.colors.surface,
                                            },
                                        ]}>
                                        <View style={styles.sessionInfo}>
                                            <AppText
                                                variant="caption"
                                                color={theme.colors.textSecondary}
                                            >
                                                {review.userName || 'Unknown User'}
                                            </AppText>

                                            <AppText
                                                variant="caption"
                                                color={theme.colors.textSecondary}
                                            >
                                                Session ID: {formatSessionId(review.sessionId)}
                                            </AppText>
                                        </View>
                                        <View style={styles.reviewCardHeader}>
                                            <View style={styles.reviewHeaderLeft}>
                                                <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                                                <View
                                                    style={[
                                                        styles.sessionTypeBadge,
                                                        { backgroundColor: theme.colors.primaryLight + '20' },
                                                    ]}>
                                                    <AppText variant="caption" color={theme.colors.primary}>
                                                        {getSessionTypeLabel(review.sessionType)}
                                                    </AppText>
                                                </View>
                                            </View>
                                            <AppText variant="caption" color={theme.colors.textTertiary}>
                                                {formatDate(review.createdAt)}
                                            </AppText>
                                        </View>

                                        {
                                            review.comment ? (
                                                <View style={[styles.commentContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
                                                    <AppText variant="body2" color={theme.colors.text}>
                                                        {review.comment}
                                                    </AppText>
                                                </View>
                                            ) : null
                                        }

                                        {
                                            review.reply ? (
                                                <View style={[styles.replyContainer, { backgroundColor: theme.colors.primaryLight + '15' }]}>
                                                    <View style={styles.replyHeader}>
                                                        <Icon name="arrow-undo" size={14} color={theme.colors.primary} />
                                                        <AppText variant="label" color={theme.colors.primary}>
                                                            Your Reply
                                                        </AppText>
                                                    </View>
                                                    <AppText variant="body2" color={theme.colors.textSecondary}>
                                                        {review.reply}
                                                    </AppText>
                                                </View>
                                            ) : null
                                        }

                                        < View style={styles.reviewFooter} >
                                            {
                                                review.isFlagged && (
                                                    <View style={[styles.flaggedBadge, { backgroundColor: theme.colors.warningLight }]}>
                                                        <Icon name="flag" size={12} color={theme.colors.warning} />
                                                        <AppText variant="caption" color={theme.colors.warning}>
                                                            Flagged
                                                        </AppText>
                                                    </View>
                                                )
                                            }
                                            < View style={[styles.statusBadge, { backgroundColor: theme.colors.successLight }]} >
                                                <AppText variant="caption" color={theme.colors.success}>
                                                    {review.sessionStatus}
                                                </AppText>
                                            </View>
                                            {!review.reply && (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.replyButton,
                                                        {
                                                            backgroundColor: theme.colors.primary,
                                                        },
                                                    ]}
                                                    onPress={() => openReplyModal(review)}
                                                >
                                                    <Icon
                                                        name="chatbox-ellipses-outline"
                                                        size={16}
                                                        color="#fff"
                                                    />

                                                    <AppText
                                                        variant="caption"
                                                        color="#fff"
                                                    >
                                                        Reply
                                                    </AppText>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )
                        }
                        <View style={styles.bottomSpacer} />
                    </View >
                )}
            </ScrollView >
            <ReviewReplyModal
                visible={replyModalVisible}
                review={selectedReview}
                loading={replyLoading}
                onClose={closeReplyModal}
                onSubmit={submitReply}
            />
        </ScreenContainer >
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        paddingTop: 16,
        gap: 12,
    },
    content: {
        paddingTop: 12,
    },
    summarySection: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 16,
    },
    summaryHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitleRow: {
        alignItems: 'center',
        gap: 6,
    },
    averageRating: {
        marginTop: 4,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    ratingBreakdown: {
        gap: 10,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingLabel: {
        minWidth: 18,
        fontWeight: '600',
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    reviewsList: {
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 12,
    },
    sessionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    reviewCard: {
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 16,
        gap: 12,
    },
    reviewCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reviewHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    sessionTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    commentContainer: {
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: 'rgba(108, 99, 255, 0.5)',
    },
    replyContainer: {
        padding: 12,
        borderRadius: 10,
        gap: 6,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reviewFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    flaggedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
        marginTop: 24,
    },
    emptyIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacer: {
        height: 40,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
});