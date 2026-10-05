export const GET_ASTROLOGER_ASSIGNED_BOOKED_SERVICES_QUERY = `
  query GetAstrologerAssignedBookedServices(
    $page: Int!
    $limit: Int!
    $bookingStatus: BookingStatus
    $paymentStatus: PaymentStatus
  ) {
    getAstrologerAssignedBookedServices(
      page: $page
      limit: $limit
      bookingStatus: $bookingStatus
      paymentStatus: $paymentStatus
    ) {
      success
      total
      currentPage
      totalPages
      limit

      data {
        id
        amount
        paymentStatus
        bookingStatus
        createdAt

        service {
          id
          name
        }
      }
    }
  }
`;
