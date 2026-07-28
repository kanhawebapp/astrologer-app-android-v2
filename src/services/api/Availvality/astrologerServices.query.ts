export const TOGGLE_ASTROLOGER_SERVICE_MUTATION = `
  mutation ToggleAstrologerService(
    $astrologerId: String!
    $serviceType: AstrologerServiceType!
    $status: Boolean!
  ) {
    toggleAstrologerService(
      astrologerId: $astrologerId
      serviceType: $serviceType
      status: $status
    ) {
      success
      message
    }
  }
`;

export const GET_ASTROLOGER_SERVICES_QUERY = `
  query GetAstrologerServices($astrologerId: String!) {
    getAstrologerById(astrologerId: $astrologerId) {
      isChatActive
      isCallActive
      isLiveActive
      isPromotional
    }
  }
`;