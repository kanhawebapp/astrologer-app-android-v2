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
import {walletService} from './walletService';
import {dummyWalletDashboard, mockWithdrawResponse} from './dummyWalletData';

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
      return {dashboard: data, isMockData: false};
    } catch (error) {
      return {dashboard: dummyWalletDashboard, isMockData: true};
    }
  },

  async requestWithdrawal(
    request: WithdrawRequest,
  ): Promise<{response: WithdrawResponse; isMockData: boolean}> {
    try {
      const response = await walletService.requestWithdrawal(request);
      return {response, isMockData: false};
    } catch (error) {
      return {response: mockWithdrawResponse, isMockData: true};
    }
  },

  getCachedDashboard(): Promise<WalletDashboard | null> {
    return Promise.resolve(null);
  },

  async getTransactionsPage(
    page: number,
    limit: number,
  ): Promise<{
    transactions: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      return await walletService.getTransactionsPage(page, limit);
    } catch (error) {
      const totalCount = dummyWalletDashboard.transactions.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = dummyWalletDashboard.transactions.slice(start, end);
      return {
        transactions: paginated,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }
  },
};
