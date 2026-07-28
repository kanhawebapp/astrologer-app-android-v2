export const GET_ASTROLOGER_PROFILE_QUERY = `
  query GetAstrologerProfile {
    getAstrologerProfile {
      success
      message

      data {
        id
        profilePic
        name
        displayName
        email
        contactNo
        about
        gender
        languages
        skills
        problems
        experience
        rating
        tags
        vtags
        status
        createdAt
        totalReviews
        totalSessions

        pricing {
          id
          type
          price
          offerPrice
          commissionPercent
          isActive
        }

        wallet {
          balanceCoins
          totalEarned
          totalWithdrawn
        }

        recentReviews {
          id
          rating
          comment
          reply
          userName
          createdAt
        }

        addresses {
          street
          city
          state
          country
          pincode
        }

        experiences {
          platformName
          yearsWorked
        }

        kycDetail {
          accountHolderName
          accountNumber
          bankName
          ifsc
          branchName
          panNumber
          aadhaarImage
          panImage
          passbookImage
          status
        }
      }
    }
  }
`;