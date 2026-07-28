export interface UploadFileResponse {
  success: boolean;
  url: string;
  filename: string;
}

export interface UploadFileData {
  uploadFile: UploadFileResponse;
}