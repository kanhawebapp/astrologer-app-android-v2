export const GET_ASTROLOGER_APP_VERSION_QUERY = `
  query GetAstrologerAppVersion($platform: String!) {
    getAstrologerAppVersion(platform: $platform) {
      success
      message
      data {
        id
        appType
        platform
        latestVersion
        minimumVersion
        forceUpdate
        maintenanceMode
        maintenanceMessage
        playStoreUrl
        appStoreUrl
        releaseNotes
        createdAt
        updatedAt
      }
    }
  }
`;