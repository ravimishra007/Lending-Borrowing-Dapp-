import type { Network, Networks } from '@/lib/types/network';

const networks: Networks = {
  97: {
    contract: '0xD92f79Ccf5f371269F1625c0e72A5A5D8d4092b2',
    token: '0x3Cd4dFcf68431976b87A534BA51523894c86539e',
    nftToken: '0x71E0C652D19E5e0CdAa5d470ddb9E7b2a86b7033',
  },
};

export const getNetwork = (chainId?: number): Network => {
  if (chainId === undefined || !networks[chainId]) {
    return networks[97];
  }
  return networks[chainId];
};
