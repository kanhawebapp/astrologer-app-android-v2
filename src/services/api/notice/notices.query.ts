export const GET_ASTROLOGER_NOTICES_QUERY = `
  query GetAstrologerNotices {
    getAstrologerNotices {
      id
      title
      description
      targetType
      isPinned
      isActive
      startDate
      endDate
      createdAt
    }
  }
`;
