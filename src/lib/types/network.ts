export type Address = `0x${string}`;

export type Network = {
  contract: Address;
  token: Address;
  nftToken: Address;
};

export type Networks = Record<number, Network>;
