import type { Network, Networks } from '@/lib/types/network';

const networks: Networks = {
  97: {
    contract: '0x195C759cFBC64ea32704e2482D9D96627eD03A76',
    token: '0x2B542335D381640335ac52642983c64589249e46',
  },
};

export const getNetwork = (chainId?: number): Network => {
  if (chainId === undefined || !networks[chainId]) {
    return networks[97];
  }
  return networks[chainId];
};
