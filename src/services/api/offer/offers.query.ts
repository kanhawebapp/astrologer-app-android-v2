
export const GET_OFFERS_QUERY = `
  query GetOffers {
    getOffers {
      success
      message

      data {
        id
        offerName
        price
        description
        isActive
        selected
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_OFFER_STATUS_MUTATION = `
  mutation UpdateOfferStatus(
    $offerId: String!
    $isActive: Boolean!
  ) {
    updateOfferStatus(
      offerId: $offerId
      isActive: $isActive
    ) {
      success
      message
    }
  }
`;