import { useState } from 'react';
import { followersApi } from './followers.api';

export const useFollowers = () => {
    const [loading, setLoading] = useState(false);
    const [followers, setFollowers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    const fetchFollowers = async (
        astrologerId: string,
        page = 1,
        limit = 20,
        token?: string,
    ) => {
        try {
            setLoading(true);

            const res = await followersApi.getAstrologerFollowers(
                astrologerId,
                page,
                limit,
                token,
            );

            const data = res?.getAstrologerFollowers;
            console.log("fetch all folllowers", data)
            setFollowers(data?.followers || []);
            setTotal(data?.total || 0);

            return data;
        } catch (err) {
            console.log('FETCH FOLLOWERS ERROR:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowersCount = async (
        astrologerId: string,
        token?: string,
    ) => {
        try {
            const res =
                await followersApi.getAstrologerFollowersCount(
                    astrologerId,
                    token,
                );

            return res?.getAstrologerFollowersCount?.totalFollowers || 0;
        } catch (err) {
            console.log('COUNT ERROR:', err);
            return 0;
        }
    };

    return {
        loading,
        followers,
        total,
        fetchFollowers,
        fetchFollowersCount,
    };
};