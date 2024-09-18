import type { Network, Networks } from '@/lib/types/network';

const networks: Networks = {
  97: {
    contract: '0xCc70071580618288Ba588F0AA3D33959306CBf14',
    token: '0xEB35Ba7A90331866965009f847cF67d4B2f98D70',
  },
};

export const getNetwork = (chainId?: number): Network => {
  if (chainId === undefined || !networks[chainId]) {
    return networks[97];
  }
  return networks[chainId];
};
