import ReactNativeBlobUtil from 'react-native-blob-util';
import {store} from '../../../store';
import {Platform} from 'react-native';
import { Config } from '../../../config/env';

export const uploadImage = {
  uploadFile: async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    try {
      const token = store.getState().auth.token;

      const filePath =
        Platform.OS === 'android'
          ? file.uri.replace('file://', '')
          : file.uri;

      console.log('========== UPLOAD FILE ==========');
      console.log('FINAL FILE PATH:', filePath);
      console.log('API URL:', Config.API_BASE_URL);
      console.log('FILE:', file);

      const res = await ReactNativeBlobUtil.fetch(
        'POST',
        Config.API_BASE_URL,
        {
          Authorization: `Bearer ${token}`,
          'x-apollo-operation-name': 'UploadFile',
        },
        [
          {
            name: 'operations',
            data: JSON.stringify({
              operationName: 'UploadFile',
              variables: {
                file: null,
              },
              query: `
                mutation UploadFile($file: Upload!) {
                  uploadFile(file: $file) {
                    success
                    url
                    filename
                    __typename
                  }
                }
              `,
            }),
          },
          {
            name: 'map',
            data: JSON.stringify({
              '1': ['variables.file'],
            }),
          },
          {
            name: '1',
            filename: file.name || 'image.jpg',
            type: file.type || 'image/jpeg',
            data: ReactNativeBlobUtil.wrap(filePath),
          },
        ],
      );

      console.log('UPLOAD STATUS:', res.info().status);
      console.log('UPLOAD RAW RESPONSE:', res.data);

      const result = JSON.parse(res.data);

      console.log(
        'UPLOAD RESULT:',
        JSON.stringify(result, null, 2),
      );

      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }

      return result;
    } catch (error) {
      console.log('❌ IMAGE UPLOAD ERROR:', error);
      throw error;
    }
  },
};