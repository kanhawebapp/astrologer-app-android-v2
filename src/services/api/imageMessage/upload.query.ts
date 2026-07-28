export const UPLOAD_FILE_MUTATION = `
  mutation UploadFile(
    $file: Upload!
  ) {
    uploadFile(file: $file) {
      success
      url
      filename
    }
  }
`;