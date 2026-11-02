export const START_LIVE_TOGGLE_SERVICES_MUTATION = `
  mutation StartLiveToggleServices(
    $astrologerId: ID!
    $serviceType: String!
    $status: Boolean!
  ) {
    startLiveToggleServices(
      astrologerId: $astrologerId
      serviceType: $serviceType
      status: $status
    ) {
      success
      message
      __typename
    }
  }
`;
