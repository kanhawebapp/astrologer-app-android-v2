// import { useCallback, useEffect, useState } from 'react';
// import { remediesApi } from '../../../../services/api/remedies/remedies.service';

// export interface RemedyItem {
//   id: string;
//   title: string;
//   description: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export const useRemedyManager = () => {
//   const [remedies, setRemedies] = useState<RemedyItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fetchRemedies = async () => {
//     try {
//       const response =
//         await remediesApi.getRemedies();

//       console.log(
//         'remedies response:',
//         JSON.stringify(response, null, 2),
//       );

//       const remediesData =
//         response?.data?.getRemedies;

//       if (remediesData?.success) {
//         console.log(
//           'remedies list:',
//           remediesData.data,
//         );

//         // setRemedies(remediesData.data);
//       }
//     } catch (error) {
//       console.log(
//         'remedies fetch error:',
//         error,
//       );
//     }
//   };

//   const sendRemedy = async (sessionId: string, message: any) => {
//     try {
//       const response =
//         await remediesApi.sendRemedy({
//           sessionId:
//             sessionId,

//           remedyText:
//             message,
//         });

//       console.log(
//         'send remedy response:',
//         JSON.stringify(response, null, 2),
//       );

//       const result =
//         response?.data?.sendRemedy;

//       if (result?.success) {
//         console.log(result.message);

//         // Alert.alert(
//         //   'Success',
//         //   result.message,
//         // );
//       }
//     } catch (error) {
//       console.log(
//         'send remedy error:',
//         error,
//       );
//     }
//   };

//   const fetchSessionRemedies = async (
//     sessionId: string,
//   ) => {
//     try {
//       const response =
//         await remediesApi.getSessionRemedies(
//           sessionId,
//         );

//       console.log(
//         'session remedies response:',
//         JSON.stringify(response, null, 2),
//       );

//       const remediesData =
//         response?.data?.getSessionRemedies;

//       if (remediesData?.success) {
//         console.log(
//           'session remedies:',
//           remediesData.data,
//         );

//         // setSessionRemedies(
//         //   remediesData.data,
//         // );
//       }
//     } catch (error) {
//       console.log(
//         'session remedies error:',
//         error,
//       );
//     }
//   };




//   // useEffect(() => {
//   //   fetchRemedies();
//   // }, [fetchRemedies]);

//   return {
//     remedies,
//     loading,
//     fetchRemedies,
//     sendRemedy,
//     fetchSessionRemedies
//   };
// };


import { useCallback, useEffect, useState } from 'react';
import { remediesApi } from '../../../../services/api/remedies/remedies.service';

export interface RemedyItem {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useRemedyManager = () => {
  const [remedies, setRemedies] = useState<RemedyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // const fetchRemedies = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     const response = await remediesApi.getRemedies();
  //     console.log('response =>', response);
  //     console.log('response.data =>', response?.data);
  //     console.log('response.getRemedies =>', response?.getRemedies);
  //     const remediesData =
  //       response?.data?.getRemedies;

  //     if (remediesData?.success) {
  //       setRemedies(remediesData.data || []);
  //     }
  //   } catch (error) {
  //     console.log(
  //       'remedies fetch error:',
  //       error,
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchRemedies = useCallback(async () => {
    try {
      setLoading(true);

      const response = await remediesApi.getRemedies();

      console.log(
        'remedies response all',
        JSON.stringify(response, null, 2),
      );

      const remediesData = response?.getRemedies;

      if (remediesData?.success) {
        setRemedies(remediesData.data ?? []);

        console.log(
          'saved remedies:',
          remediesData.data,
        );
      } else {
        setRemedies([]);
      }
    } catch (error) {
      console.log(
        'remedies fetch error:',
        error,
      );

      setRemedies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // const activateRemedy = async (
  //   remedyId: string,
  // ) => {
  //   try {
  //     const response =
  //       await remediesApi.updateRemedyStatus({
  //         remedyId,
  //         isActive: true,
  //       });

  //     const result =
  //       response?.data?.updateRemedyStatus;

  //     if (result?.success) {
  //       await fetchRemedies();
  //     }
  //   } catch (error) {
  //     console.log(
  //       'activate remedy error:',
  //       error,
  //     );
  //   }
  // };

  // const deactivateRemedy = async (
  //   remedyId: string,
  // ) => {
  //   try {
  //     const response =
  //       await remediesApi.updateRemedyStatus({
  //         remedyId,
  //         isActive: false,
  //       });

  //     const result =
  //       response?.data?.updateRemedyStatus;

  //     if (result?.success) {
  //       await fetchRemedies();
  //     }
  //   } catch (error) {
  //     console.log(
  //       'deactivate remedy error:',
  //       error,
  //     );
  //   }
  // };

  // const sendRemedy = async (
  //   sessionId: string,
  //   message: string,
  // ) => {
  //   try {
  //     const response =
  //       await remediesApi.sendRemedy({
  //         sessionId,
  //         remedyText: message,
  //       });

  //     const result =
  //       response?.data?.sendRemedy;

  //     if (result?.success) {
  //       console.log(result.message);
  //     }
  //   } catch (error) {
  //     console.log(
  //       'send remedy error:',
  //       error,
  //     );
  //   }
  // };

  const sendRemedy = async ({
    sessionId,
    remedyText,
  }: {
    sessionId: string;
    remedyText: string;
  }) => {
    try {
      const response = await remediesApi.sendRemedy({
        sessionId,
        remedyText,
      });

      return response?.sendRemedy;
    } catch (error) {
      console.log('send remedy error:', error);
      throw error;
    }
  };


  // const fetchSessionRemedies =
  //   async (sessionId: string) => {
  //     try {
  //       console.log("getting session remedies for session id:", sessionId);
  //       const response =
  //         await remediesApi.getSessionRemedies(
  //           sessionId,
  //         );

  //       const remediesData =
  //         response?.data?.getSessionRemedies;
  //         console.log(
  //           'session remedies response:',
  //           JSON.stringify(response, null, 2),
  //         );

  //       if (remediesData?.success) {
  //         return remediesData.data || [];
  //       }

  //       return [];
  //     } catch (error) {
  //       console.log(
  //         'session remedies error:',
  //         error,
  //       );
  //       return [];
  //     }
  //   };

  const fetchSessionRemedies = useCallback(
    async (sessionId: string) => {
      try {
        console.log("getting session remedies for session id:", sessionId);
        const response =
          await remediesApi.getSessionRemedies(
            sessionId,
          );
         console.log(
          'session remedies response:',
          JSON.stringify(response, null, 2),
        );
        return response?.getSessionRemedies?.data ?? [];
      } catch (error) {
        console.log(
          'session remedies error:',
          error,
        );
        return [];
      }
    },
    [],
  );

  useEffect(() => {
    fetchRemedies();
  }, [fetchRemedies]);

  return {
    remedies,
    loading,
    fetchRemedies,
    // fetchSessionRemedies,
    sendRemedy,
    // activateRemedy,
    // deactivateRemedy,
  };
};


