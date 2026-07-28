import ReactNativeBlobUtil from 'react-native-blob-util';
import { Config } from '@config/env';
import { store } from '../../../store';
import { Platform } from 'react-native';

export const uploadImage = async (file: { uri: any; name: any; type: any }) => {
  try {
    const token = store.getState().auth.token;
    // const BASE_URL = 'https://dhwaniastro.com/userAuth/graphql';

    const filePath =
      Platform.OS === 'android' ? file.uri.replace('file://', '') : file.uri;

    console.log('FINAL FILE PATH:', filePath);
    console.log('Config.API_BASE_URL', Config.API_BASE_URL);

    const res = await ReactNativeBlobUtil.fetch(
      'POST',
      Config.API_BASE_URL,
      {
        Authorization: `Bearer ${token}`,
        'x-apollo-operation-name': 'UploadImage',
        // ❌ NO Content-Type here
      },
      [
        {
          name: 'operations',
          data: JSON.stringify({
            operationName: 'UploadImage',
            query: `
              mutation UploadImage($file: Upload!) {
                uploadImage(file: $file) {
                  url
                }
              }
            `,
            variables: { file: null },
          }),
        },
        {
          name: 'map',
          data: JSON.stringify({
            '0': ['variables.file'], // 🔥 CHANGE BACK TO 0
          }),
        },
        {
          name: '0', // 🔥 MATCH MAP KEY
          filename: file.name || 'image.jpg',
          type: file.type || 'image/jpeg',
          data: ReactNativeBlobUtil.wrap(filePath),
        },
      ],
    );

    const result = JSON.parse(res.data);

    console.log('UPLOAD RESULT:', result);

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.uploadImage.url;
  } catch (err) {
    console.log('❌ IMAGE UPLOAD ERROR:', err);
    throw err;
  }
};
