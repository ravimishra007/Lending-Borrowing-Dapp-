'use client';

import type { Abi } from 'viem';
import { wagmiConfig } from '../config';
import useNetworkData from './useNetworkData';
import { contractABI } from '../abis/contract';
import { handleError } from '@/lib/utils/errors';
import { useReadContract, useWriteContract } from 'wagmi';
import type { Config, UseReadContractParameters, UseWriteContractParameters } from 'wagmi';

type UseContractReadParameters = Omit<UseReadContractParameters, 'abi' | 'address' | 'functionName' | 'args'>;

export function useContractRead<T = unknown>(
  functionName: string,
  args: Array<any> = [],
  options?: UseContractReadParameters,
) {
  const { contract } = useNetworkData();
  console.log('contract--->', contract);

  return useReadContract<Abi, string, Array<any>, Config, T>({
    abi: contractABI as Abi,
    address: contract,
    functionName: functionName,
    args,
    query: {} as any,
    ...options,
  });
}
// type FuntionName = ContractFunctionName<typeof abi, "nonpayable" | "view" | "pure">;
// type Args = ContractFunctionArgs<typeof abi, "nonpayable" | "view" | "pure", FuntionName>;

type useContractWriteParameters = Pick<UseWriteContractParameters, 'mutation'>['mutation'];

export function useContractWrite(functionName: string, options?: useContractWriteParameters) {
  const { contract } = useNetworkData();
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

  const write = async (args: Array<any> = [], overrides = {}) => {
    return await writeContractAsync({
      abi: contractABI as Abi,
      address: contract,
      args,
      functionName,
      ...overrides,
    });
  };
  return { write, ...rest };
}
