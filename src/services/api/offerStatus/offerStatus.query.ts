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