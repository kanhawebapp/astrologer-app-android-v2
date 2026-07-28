export interface AstrologerAppVersion {
  id: string;
  appType: string;
  platform: string;
  latestVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  playStoreUrl: string | null;
  appStoreUrl: string | null;
  releaseNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAstrologerAppVersionVariables {
  platform: string;
}

export interface GetAstrologerAppVersionData {
  getAstrologerAppVersion: {
    success: boolean;
    message: string;
    data: AstrologerAppVersion;
  };
}