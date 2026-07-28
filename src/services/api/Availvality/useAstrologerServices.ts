import { useState } from 'react';
import { astrologerServicesApi } from './astrologerServices.api';
import {
  ToggleAstrologerServiceInput,
} from './astrologerServices.types';

export const useAstrologerServices = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any>(null);

  // const getAstrologerServices = async (token?: any) => {
  //   try {
  //     setLoading(true);

  //     const res =
  //       await astrologerServicesApi.getAstrologerServices(token);

  //     const data = res?.getAstrologerById?.data;

  //     setServices(data);

  //     return data;
  //   } catch (err) {
  //     console.log('GET SERVICES ERROR:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getAstrologerServices = async (
    astrologerId: string,
    token?: string,
  ) => {
    try {
      setLoading(true);

      const res =
        await astrologerServicesApi.getAstrologerServices(
          astrologerId,
          token,
        );

      const data = res?.getAstrologerById;

      setServices(data);

      return data;
    } catch (err) {
      console.log('GET SERVICES ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAstrologerService = async (
    input: ToggleAstrologerServiceInput,
    token?: string,
  ) => {
    try {
      setLoading(true);

      const res =
        await astrologerServicesApi.toggleAstrologerService(
          input,
          token,
        );

      return res?.toggleAstrologerService;
    } catch (err) {
      console.log('TOGGLE ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    services,
    getAstrologerServices,
    toggleAstrologerService,
  };
};