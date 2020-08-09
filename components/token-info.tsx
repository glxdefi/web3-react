
import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import {useWeb3React } from '@web3-react/core'
import ethers, { BigNumber} from 'ethers'
import { MyContext } from '../context'
import { formatUnits, formatEther } from '../utils'

function TokenInfo({ address }: { address?: string }) {
  const { library, account, chainId, active} = useWeb3React<Web3Provider>();
  const { contracts, pendings, tokenDetails, setTokenDetails } = React.useContext(MyContext)
  React.useEffect(() => {
    if (!!library && account) {

      (async () => {
        const HOPE = contracts.HOPE;
        if(!HOPE) return
        const [ HopeBalanceOf, totalSupply] = await Promise.all([
          HOPE?.balanceOf(account),
          HOPE?.totalSupply()
        ]);
        const _totalSupply = formatEther(totalSupply)
        const _HopeBalanceOf =  formatEther(HopeBalanceOf)
        setTokenDetails({ HopeBalanceOf: _HopeBalanceOf, totalSupply: _totalSupply});
      })();
    }
  }, [account, address, active, pendings, contracts.HOPE]);

  return (
    <div>
    </div>
  );
}

export default TokenInfo;