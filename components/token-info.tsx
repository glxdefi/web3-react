
import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import {useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
import ethers, { BigNumber} from 'ethers'
import { MyContext } from '../context'



function TokenInfo({ address }: { address?: string }) {
  const { library, account, chainId} = useWeb3React<Web3Provider>();
  const { contracts } = React.useContext(MyContext)

  const [tokenDetails, setTokenDetails] = React.useState<Object>({
    DAIBalanceOf: 0, HopeBalanceOf: 0
  });

  React.useEffect(() => {
    if (!!library && typeof address !== 'undefined') {

      (async () => {
        const HOPE = new ethers.Contract(address, contracts.HOPE.address, library);
        const DAI = new ethers.Contract(address, contracts.DAI.address, library);
        const [DAIBalanceOf, HopeBalanceOf] = await Promise.all([
          DAI.balanceOf(account),
          HOPE.balanceOf(account),
        ]);
        console.log({ DAIBalanceOf, HopeBalanceOf });
        setTokenDetails({ DAIBalanceOf, HopeBalanceOf });
      })();
    }
  }, [account, address, library, chainId]);

  return (
    <div>
    </div>
  );
}

export default TokenInfo;