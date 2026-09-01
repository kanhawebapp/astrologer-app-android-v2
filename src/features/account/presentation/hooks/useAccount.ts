import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {
  fetchAccountDashboard,
  updateAvailability as updateAvailabilityAction,
  updatePricing as updatePricingAction,
} from '../../../../store/slices/accountSlice';
import {
  AccountDashboard,
  Availability,
  Pricing,
  Stats,
  UpdateAvailabilityInput,
  UpdatePricingInput,
} from '../../domain/types';
import {reviewsApi} from '../../../../services/api/getReview/reviews.service';

export const useAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    dashboard,
    profile,
    pricing,
    availability,
    stats,
    loading,
    updating,
    error,
    isMockData,
  } = useSelector((state: RootState) => state.account);

  const loadDashboard = useCallback(async () => {
    try {
      await dispatch(fetchAccountDashboard()).unwrap();
    } catch (err) {
      // console.log('=== USE ACCOUNT HOOK ERROR ===');
      console.log('Error:', err);
      // console.log('=============================');
    }
  }, [dispatch]);

  useEffect(() => {
    if (!dashboard && !loading) {
      loadDashboard();
    }
  }, [dashboard, loading, loadDashboard]);

  const refreshDashboard = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  const updateAvailability = useCallback(
    async (input: UpdateAvailabilityInput) => {
      try {
        await dispatch(updateAvailabilityAction(input)).unwrap();
        return {success: true};
      } catch (err) {
        return {success: false, error: err};
      }
    },
    [dispatch],
  );

  const updatePricing = useCallback(
    async (input: UpdatePricingInput) => {
      try {
        await dispatch(updatePricingAction(input)).unwrap();
        return {success: true};
      } catch (err) {
        return {success: false, error: err};
      }
    },
    [dispatch],
  );

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewsApi.getAstrologerReviews({
        page: 1,
        limit: 10,
        rating: 3,
      });

      const reviewsData = response?.data?.getAstrologerReviews;

      if (reviewsData?.success) {
        // console.log('reviews:', reviewsData.data);
        // setReviews(reviewsData.data);
      }
    } catch (error) {
      console.log('reviews error:', error);
    }
  }, []);

  return {
    dashboard: dashboard as AccountDashboard | null,
    profile,
    pricing: pricing as Pricing | null,
    availability: availability as Availability | null,
    stats: stats as Stats | null,
    loading,
    updating,
    error,
    isMockData,
    refreshDashboard,
    updateAvailability,
    updatePricing,
    fetchReviews,
  };
};
