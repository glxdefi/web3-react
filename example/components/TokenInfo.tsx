
import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import {useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
import ethers, { BigNumber} from 'ethers'
import { MyContext } from '../context'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ERC20_ABI = require('./erc20.abi.json');

type Erc20DetailsObject = {
  name?: string;
  symbol?: string;
  balanceOf?: BigNumber;
};

function TokenInfo({ address }: { address: string }) {
  const { library, account, chainId} = useWeb3React<Web3Provider>();

  const [tokenDetails, setTokenDetails] = React.useState<Erc20DetailsObject | null>(
    null
  );

  React.useEffect(() => {
    if (!!library && typeof address !== 'undefined') {
      const contract = new ethers.Contract(address, ERC20_ABI, library);

      (async () => {
        const [name, symbol, balanceOf] = await Promise.all([
          contract.name(),
          contract.symbol(),
          account ? contract.balanceOf(account) : undefined,
        ]);

        setTokenDetails({ name, symbol, balanceOf });
      })();
    }
  }, [account, address, library, chainId]);

  return (
    <div>
      {address}:{' '}
      {(tokenDetails && (
        <>
          {tokenDetails.name}
          {(account && (
            <p>
              Balance of {account}:{' '}
              {`${formatEther(tokenDetails.balanceOf?.toString())} ${tokenDetails.symbol}`}
            </p>
          ))}
        </>
      )) ||
        '...'}
    </div>
  );
}

export default TokenInfo;