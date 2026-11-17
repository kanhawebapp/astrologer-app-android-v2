export const GET_MY_LIVE_INTERACTION_HISTORY_QUERY = `
  query GetMyLiveInteractionHistory(
    $searchInput: MyAstrologerLiveInteractionHistorySearchInput
  ) {
    getMyLiveInteractionHistory(searchInput: $searchInput) {
      data {
        sessionId
        liveStreamId
        userId
        userName
        astrologerId
        interactionType
        status
        ratePerMin
        chargedCoins
        astrologerEarned
        durationSeconds
        billableMinutes
        requestedAt
        acceptedAt
        startedAt
        endedAt
        createdAt
      }
      totalCount
      currentPage
      totalPages
      totalCoinsCollected
      totalAstrologerEarnings
      totalAudioCalls
      totalVideoCalls
    }
  }
`;
