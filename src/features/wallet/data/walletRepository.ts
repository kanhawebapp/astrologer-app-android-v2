// import {
//   WalletDashboard,
//   WithdrawRequest,
//   WithdrawResponse,
// } from '../domain/types';
// import { walletService } from './walletService';

// export const walletRepository = {
//   async getDashboard(): Promise<{
//     dashboard: WalletDashboard;
//     isMockData: boolean;
//   }> {
//     try {
//       const data = await walletService.getWalletDashboard();
//       return { dashboard: data, isMockData: false };
//     } catch (error) {
//       const { dummyWalletDashboard } = await import('./dummyWalletData');
//       return { dashboard: dummyWalletDashboard, isMockData: true };
//     }
//   },

//   async requestWithdrawal(
//     request: WithdrawRequest,
//   ): Promise<{ response: WithdrawResponse; isMockData: boolean }> {
//     try {
//       const response = await walletService.requestWithdrawal(request);
//       return { response, isMockData: false };
//     } catch (error) {
//       const { mockWithdrawResponse } = await import('./dummyWalletData');
//       return { response: mockWithdrawResponse, isMockData: true };
//     }
//   },

//   getCachedDashboard(): WalletDashboard | null {
//     return null;
//   },
// };


import {
  WalletDashboard,
  WithdrawRequest,
  WithdrawResponse,
} from '../domain/types';
import { walletService } from './walletService';

export const walletRepository = {
  async getDashboard(): Promise<{
    dashboard: WalletDashboard;
    isMockData: boolean;
  }> {
    try {
      console.log('🔥 walletRepository.getDashboard', {
        timestamp: new Date().toISOString(),
      });
      const data = await walletService.getWalletDashboard();
      return { dashboard: data, isMockData: false };
    } catch (error) {
      const { dummyWalletDashboard } = await import('./dummyWalletData');
      return { dashboard: dummyWalletDashboard, isMockData: true };
    }
  },

  async requestWithdrawal(
    request: WithdrawRequest,
  ): Promise<{ response: WithdrawResponse; isMockData: boolean }> {
    try {
      const response = await walletService.requestWithdrawal(request);
      return { response, isMockData: false };
    } catch (error) {
      return { response: mockWithdrawResponse, isMockData: true };
    }
  },

  getCachedDashboard(): WalletDashboard | null {
    return null;
  },
};
