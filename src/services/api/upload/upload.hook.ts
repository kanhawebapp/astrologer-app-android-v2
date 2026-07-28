
import { useState } from 'react';
import { uploadImage } from './upload.api';

export const useUploadImage = () => {
  const [loading, setLoading] = useState(false);

  const upload = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    try {
      setLoading(true);
      const url = await uploadImage(file);
      return url;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading };
};