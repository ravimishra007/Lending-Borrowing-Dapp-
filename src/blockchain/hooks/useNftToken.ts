'use client';

import type { Abi } from 'viem';
import { wagmiConfig } from '../config';
import useNetworkData from './useNetworkData';
import { handleError } from '@/lib/utils/errors';
import { useReadContract, useWriteContract } from 'wagmi';
import type { Config, UseReadContractParameters, UseWriteContractParameters } from 'wagmi';
import { nftTokenABI } from '../abis/nftToken';

type UseTokenReadParameters = Omit<UseReadContractParameters, 'abi' | 'address' | 'functionName' | 'args'>;

export function useNftTokenRead<T = unknown>(
  functionName: string,
  args: Array<any> = [],
  options?: UseTokenReadParameters,
) {
  const { nftToken } = useNetworkData();
  console.log('nftToken--->', nftToken);

  return useReadContract<Abi, string, Array<any>, Config, T>({
    abi: nftTokenABI as Abi,
    address: nftToken,
    functionName: functionName,
    args,
    query: {} as any,
    ...options,
  });
}

type useTokenWriteParameters = Pick<UseWriteContractParameters, 'mutation'>['mutation'];

export function useNftTokenWrite(functionName: string, options?: useTokenWriteParameters) {
  const { nftToken } = useNetworkData();
  const { writeContractAsync, writeContract, ...rest } = useWriteContract({
    config: wagmiConfig,
    mutation: {
      onError: (error) => {
        handleError(error);
      },
      onSettled: (data) => {
        console.log(data);
      },
      ...options,
    },
  });

  const write = async (args: Array<any> = []) => {
    const txHash = await writeContractAsync({
      abi: nftTokenABI as Abi,
      address: nftToken,
      args,
      functionName,
    });
    return txHash;
  };
  return { write, ...rest };
}
