export const GET_ASTROLOGER_ASSIGNED_BOOKED_SERVICES_QUERY = `
  query GetAstrologerAssignedBookedServices(
    $page: Int!
    $limit: Int!
  ) {
    getAstrologerAssignedBookedServices(
      page: $page
      limit: $limit
    ) {
      success
      total
      currentPage
      totalPages
      limit

      data {
        id
        name
        dob
        tob
        pob
        gender
        concern
        amount
        paymentStatus
        bookingStatus
        createdAt

        service {
          id
          name
          price
        }
      }
    }
  }
`;