import { getAuthToken } from '../../socket/socketManager';
import { UPLOAD_FILE_MUTATION } from './upload.query';
import { UploadFileData } from './upload.types';

export const uploadApi = {
    uploadFile: async (
        file: {
            uri: string;
            name: string;
            type: string;
        },
        token?: string,
    ): Promise<{ data: UploadFileData }> => {
        console.log(
            '=========== UPLOAD FILE REQUEST ===========',
        );

        console.log('File:', file);
        const API_BASE_URL = 'https://dhwaniastro.com';

        const authToken = token || (await getAuthToken());

        const formData = new FormData();

        formData.append(
            'operations',
            JSON.stringify({
                operationName: 'UploadFile',
                query: UPLOAD_FILE_MUTATION,
                variables: {
                    file: null,
                },
            }),
        );

        formData.append(
            'map',
            JSON.stringify({
                '1': ['variables.file'],
            }),
        );

        formData.append('1', {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            body: formData,
        });

        const json = await response.json();

        console.log(
            'UPLOAD RESPONSE:',
            JSON.stringify(json, null, 2),
        );

        return json;
    },
};