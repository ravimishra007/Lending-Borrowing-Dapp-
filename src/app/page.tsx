'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import ConnectButton from '@/components/shared/ConnectButton';
import { useContractRead, useContractWrite, useTokenRead, useTokenWrite } from '@/blockchain/hooks';
import useToast from '@/hooks/useToast';
import useNetworkData from '@/blockchain/hooks/useNetworkData';

export default function Home() {
  const toast = useToast();
  const { address } = useAccount();
  const { contract } = useNetworkData();
  const [activeSection, setActiveSection] = useState<'lending' | 'borrowing' | null>('lending');
  const handleSectionClick = (section: 'lending' | 'borrowing') => {
    if (activeSection === section) {
      setActiveSection(null); // Close section if clicked again
    } else {
      setActiveSection(section);
    }
  };

  // token
  const [recipient1, setRecipient1] = useState('');
  const [recipient2, setRecipient2] = useState('');
  const [recipient3, setRecipient3] = useState('');
  const [recipient5, setRecipient5] = useState('');
  const [recipient4, setRecipient4] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isProvidingCollateral, setIsProvidingCollateral] = useState(false);

  const tokenName = useTokenRead<string>('name');
  const tokenBalance = useTokenRead<bigint>('balanceOf', [address]);
  const tokenDecimals = useTokenRead<bigint>('decimals');
  const tokenSymbol = useTokenRead<string>('symbol');

  // contract
  const totalDeposits = useContractRead<bigint>('totalDeposits');
  const totalLoans = useContractRead<bigint>('totalLoans');
  const collateralFactor = useContractRead<bigint>('collateralFactor');
  const interestRate = useContractRead<bigint>('interestRate');

  const totalDepositsData = Number(totalDeposits.data);
  const totalLoansData = Number(totalLoans.data);
  const collateralFactorData = Number(collateralFactor.data);
  const interestRateData = Number(interestRate.data);
  // const tokenBalanceData = formatUnits(tokenBalance.data || BigInt(0), tokenDecimalsData);
  // const tokenSymbolData = tokenSymbol.data as string;

  // approved
  const tokenApprove = useTokenWrite('approve', {
    onSuccess(data) {
      console.log('data: approve write ---->', data);
    },
  });

  const tokenNameData = tokenName.data;
  const tokenDecimalsData = Number(tokenDecimals.data);
  const tokenBalanceData = formatUnits(tokenBalance.data || BigInt(0), tokenDecimalsData);
  const tokenSymbolData = tokenSymbol.data as string;

  const handleApprove = async () => {
    if (!recipient1) return toast('Please enter recipient address', 'error');
    const amount = parseUnits('1000', tokenDecimalsData);
    await tokenApprove.write([recipient1, amount]);
    toast('approved successful', 'success');
  };

  // Deposit
  const tokenDeposit = useContractWrite('deposit', {
    onSuccess(data) {
      console.log('data: deposit write ---->', data);
      toast('Deposit successful', 'success');
    },
    onError(error) {
      console.log('Deposit failed: ', error);
      toast('Deposit failed', 'error');
    },
  });

  // const handleDeposit = async () => {
  //   if (!recipient2) return toast('Please enter amount', 'error');
  //   const depositAmount = parseUnits(recipient2, 18);
  //   try {
  //     // Call the write method with the depositAmount in the overrides field
  //     await tokenDeposit.write([], { value: depositAmount });
  //   } catch (error) {
  //     console.log('Deposit error:', error);
  //     toast('Deposit failed', 'error');
  //   }
  // };
  const handleDeposit = async () => {
    console.log('handleDeposit called with amount:', recipient2);
    if (!recipient2) {
      console.log('Invalid amount entered');
      return toast('Please enter a valid amount', 'error');
    }
    const depositAmount = parseUnits(recipient2, 18);
    console.log('Parsed deposit amount:', depositAmount.toString());
    try {
      await tokenDeposit.write([], { value: depositAmount });
      console.log('Deposit transaction submitted');
      // toast('Deposit successful', 'success');
    } catch (error) {
      console.error('Deposit error:', error);
      // toast(`Deposit failed: ${error.message}`, 'error');
    }
  };

  // widthdraw
  const tokenWithdraw = useContractWrite('withdraw', {
    onSuccess(data) {
      console.log('data: withdraw write ---->', data);
      toast('Withdrawal successful', 'success');
    },
    onError(error) {
      console.log('Withdrawal failed: ', error);
      toast('Withdrawal failed', 'error');
    },
  });

  const handleWithdraw = async () => {
    try {
      await tokenWithdraw.write();
    } catch (error) {
      console.log('Withdraw error:', error);
    }
  };

  // Collateral
  const tokenProvideCollateral = useContractWrite('provideCollateral', {
    onSuccess(data) {
      console.log('data: provideCollateral write ---->', data);
      toast('Collateral provided successfully', 'success');
    },
    onError(error) {
      console.log('Collateral submission failed: ', error);
      toast('Collateral submission failed', 'error');
    },
  });

  // const handleProvideCollateral = async () => {
  //   if (!recipient3) return toast('Please enter collateral amount', 'error');
  //   const collateralAmount = parseUnits(recipient3, 18);
  //   try {
  //     await tokenApprove.write();

  //     await tokenProvideCollateral.write([collateralAmount]);
  //     toast('Collateral provided successfully', 'success');
  //   } catch (error) {
  //     console.log('Provide Collateral error:', error);
  //     toast('Collateral submission failed', 'error');
  //   }
  // };

  const handleProvideCollateral = async () => {
    if (!recipient3) {
      return toast('Please enter a valid collateral amount', 'error');
    }

    const collateralAmount = parseUnits(recipient3, 18);

    try {
      // Inform the user that approval is starting
      setIsApproving(true);

      // Step 1: Approve the contract to spend tokens
      const approveTx = await tokenApprove.write([contract, collateralAmount]);
      // await approveTx.wait(); // Wait for the transaction to be mined
      setIsApproving(false);
      // Inform the user that collateral provision is starting
      setIsProvidingCollateral(true);

      // Step 2: Provide collateral
      const collateralTx = await tokenProvideCollateral.write([collateralAmount]);
      // await collateralTx.wait(); // Wait for the transaction to be mined

      setIsProvidingCollateral(false);

      toast('Collateral provided successfully', 'success');
    } catch (error) {
      setIsApproving(false);
      setIsProvidingCollateral(false);

      console.error('Provide Collateral error:', error);
      // const errorMessage = error?.data?.message || error.message;
      toast(`Collateral submission failed: `, 'error');
    }
  };

  // borrow

  const tokenBorrow = useContractWrite('borrow', {
    onSuccess(data) {
      console.log('data: borrow write ---->', data);
      toast('Borrow successful', 'success');
    },
    onError(error) {
      console.log('Borrow failed: ', error);
      toast('Borrow failed', 'error');
    },
  });

  const handleBorrow = async () => {
    if (!recipient4) return toast('Please enter loan amount', 'error');

    const loanAmount = parseUnits(recipient4, 18);

    try {
      await tokenBorrow.write([loanAmount]);
      toast('Borrow successful', 'success');
    } catch (error) {
      console.log('Borrow error:', error);
      toast('Borrow failed', 'error');
    }
  };

  // repay

  const tokenRepayLoan = useContractWrite('repayLoan', {
    onSuccess(data) {
      console.log('data: repayLoan write ---->', data);
      toast('Repayment successful', 'success');
    },
    onError(error) {
      console.log('Repayment failed: ', error);
      toast('Repayment failed', 'error');
    },
  });

  const handleRepayLoan = async () => {
    if (!recipient5) return toast('Please enter repayment amount', 'error');

    // Parse the repayment amount to Ether
    const repaymentAmount = parseUnits(recipient5, 18);

    try {
      await tokenRepayLoan.write([], { value: repaymentAmount });
      toast('Repayment successful', 'success');
    } catch (error) {
      console.log('Repay Loan error:', error);
      toast('Repayment failed', 'error');
    }
  };

  return (
    <main className="h-screen w-full flex justify-center items-center bg-black text-white">
      <div className="flex flex-col gap-3 items-center  border w-[60%]">
        <ConnectButton />

        {address ? (
          <div className="  w-[100%] m-auto flex flex-col justify-center items-center gap-1 ">
            <div className="flex justify-around    w-full">
              <p>
                Token Balance: <span className="text-green-500 font-bold ">{tokenBalanceData}</span>
              </p>
              <p>
                Token Name: <span className="text-green-500 font-bold">{tokenNameData}</span>
              </p>
            </div>
            <div className="flex justify-around    w-full">
              <p>
                Token Decimals: <span className="text-green-500 font-bold">{tokenDecimalsData} </span>
              </p>
              <p>
                Token Symbol: <span className="text-green-500 font-bold">{tokenSymbolData}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Connect Your Wallet</p>
        )}
        <div className="flex gap-5">
          <input
            type="text"
            placeholder="Enter recipient address"
            className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
            value={recipient1}
            onChange={(e) => setRecipient1(e.target.value)}
          />
          <button className="border-cyan-700 border-2 rounded-md px-3 py-1" onClick={handleApprove}>
            Approve
          </button>
        </div>
        <hr className="border w-[90%]" />
        <div className="w-full">
          <h1 className=" text-center font-bold text-2xl mt-[-12px]">Lending and Borrowing </h1>
          <div className="   w-[100%] mb-1  flex flex-col justify-center items-center">
            <div className="flex justify-around    w-full">
              <p>
                Total Deposit: <span className="text-green-500 font-bold">{totalDepositsData}</span>
              </p>

              <p>
                collateral Factor: <span className="text-green-500 font-bold">{collateralFactorData} </span>
              </p>
            </div>
            <div className="flex justify-around    w-full">
              <p>
                Total Loan: <span className="text-green-500 font-bold">{totalLoansData}</span>
              </p>
              <p>
                interest Rate: <span className="text-green-500 font-bold">{interestRateData}%</span>
              </p>
            </div>
          </div>
          <div className="border  ">
            <div className="w-full h-[45px] flex flex-row">
              <div
                onClick={() => handleSectionClick('lending')}
                className={`${activeSection === 'lending' ? 'bg-slate-900' : 'bg-black'} flex flex-col justify-center w-[50%] border`}
              >
                <button>Lending</button>
              </div>

              <div
                onClick={() => handleSectionClick('borrowing')}
                className={`${activeSection === 'borrowing' ? 'bg-slate-900' : 'bg-black'} flex flex-col justify-center w-[50%] border`}
              >
                <button>Borrow</button>
              </div>
            </div>

            {/* Lending Section */}
            {activeSection === 'lending' && (
              <div className="bg-slate-900 border flex flex-col  justify-center items-center gap-4  ">
                <div className="flex gap-5 mt-8 ">
                  <input
                    type="text"
                    placeholder="Enter amount in Eth"
                    className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
                    value={recipient2}
                    onChange={(e) => setRecipient2(e.target.value)}
                  />
                  <button className="border-cyan-700 border-2 rounded-md px-3 bg-black " onClick={handleDeposit}>
                    Deposit in Lending Pool
                  </button>
                </div>
                <div className="flex w-[57%] mb-5">
                  <button className="bg-red-600 w-full border-2 rounded-md p-2  " onClick={handleWithdraw}>
                    Withdraw
                  </button>
                </div>
              </div>
            )}

            {/* <div className="flex gap-5 mt-4">
            <input
              type="text"
              placeholder="Enter collateral amount"
              className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
              value={recipient3}
              onChange={(e) => setRecipient3(e.target.value)}
            />
            <button className="border-cyan-700 border-2 rounded-md px-3 py-1" onClick={handleProvideCollateral}>
              Provide Collateral
            </button>
          </div> */}

            {/* Borrowing Section */}
            {activeSection === 'borrowing' && (
              <div className="bg-slate-900">
                <div className="flex justify-evenly  ">
                  <div className="flex gap-5 mt-4">
                    <input
                      type="text"
                      placeholder="Enter loan amount in Eth"
                      className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
                      value={recipient4}
                      onChange={(e) => setRecipient4(e.target.value)}
                    />
                    <button className="border-cyan-700 bg-black border-2 rounded-md px-3 py-1" onClick={handleBorrow}>
                      Borrow
                    </button>
                  </div>
                  <div className="flex gap-5 mt-4">
                    <input
                      type="text"
                      placeholder="Enter repayment amount in Eth"
                      className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
                      value={recipient5}
                      onChange={(e) => setRecipient5(e.target.value)}
                    />
                    <button className="bg-red-600 border-2 rounded-md px-3 py-1" onClick={handleRepayLoan}>
                      Repay Loan
                    </button>
                  </div>
                </div>

                <div className="flex flex-col border w-full gap-5 mt-2  p-2 m-auto">
                  <p className="text-gray-500 ">
                    <strong>NOTE : </strong>To provide collateral, first you have to approved the token with this
                    Address <strong>0xCc70071580618288Ba588F0AA3D33959306CBf14</strong> then please enter the amount of
                    tokens you'd like to lock and follow the prompts to approve and submit your collateral.
                  </p>

                  <input
                    type="text"
                    placeholder="Enter collateral amount"
                    className="p-2 border-none rounded-md focus:outline-cyan-300 text-black"
                    value={recipient3}
                    onChange={(e) => setRecipient3(e.target.value)}
                    disabled={isApproving || isProvidingCollateral}
                  />

                  <button
                    className="border-cyan-700 bg-black border-2 rounded-md h-[40px]"
                    onClick={handleProvideCollateral}
                    disabled={isApproving || isProvidingCollateral}
                  >
                    {isApproving
                      ? 'Approving...'
                      : isProvidingCollateral
                        ? 'Providing Collateral...'
                        : 'Provide Collateral'}
                  </button>

                  {isApproving && (
                    <p className="text-gray-600 mt-2">
                      Please confirm the <strong>approval</strong> transaction in your wallet.
                    </p>
                  )}

                  {isProvidingCollateral && (
                    <p className="text-gray-600 mt-2">
                      Please confirm the <strong>collateral</strong> transaction in your wallet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
