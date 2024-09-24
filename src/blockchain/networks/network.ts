import type { Network, Networks } from '@/lib/types/network';

const networks: Networks = {
  97: {
    contract: '0x832a0BA8e07f8f79345fD8f65C309b41739a4e0C',
    token: '0x404561f742d8C2D359f3cbd9a2845a58d0Cb9137',
  },
};

export const getNetwork = (chainId?: number): Network => {
  if (chainId === undefined || !networks[chainId]) {
    return networks[97];
  }
  return networks[chainId];
};
