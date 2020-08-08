import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
import { Provider, MyContext } from '../context'
import ethers, { BigNumber } from 'ethers'
const ERC20_ABI = require('./abi/ERC20.json');
const DAI = require('./abi/MockErc20.json');
const GLXFactory = require('./abi/GLXFactory.json');
const GLXRouter = require('./abi/GLXRouter.json');
const GLXGame = require('./abi/GLXGame.json');

const CONTRACTS = {
  "HOPE": { address: "0x07cb0142D9b8fce61a321cffAf2c3a09933B1C37", abi: ERC20_ABI.abi },
  "DAI": {
    address: "0xa2Fd9953b79171e32C9895DD7b538c0ccac75628", abi: DAI.abi
  },
  "CDAI": {
    address: "0x1D7DC6Ab4B122eF3398E134C15ebD6A3A0771DAd", abi: DAI.abi
  },
  "GLXRouter": {
    address: "0xf72211d9142BB681f15C006479060d04e47F698d", abi: GLXRouter.abi
  },
  "GLXFactory": {
    address: "0x109f60d6716E798bb198Bc0ce2B2a26cf8855b33", abi: GLXFactory.abi
  },
  "GLXGame": {
    address: "0x349fD926873Ea0FEd77424a0536adFb0CB16c2e9", abi: GLXGame.abi
  }
}

function getContract(name, web3): ethers.Contract {
  return new ethers.Contract(CONTRACTS[name]['address'], CONTRACTS[name]['abi'], web3);
}
const Contracts = function () {
  const { library, account, chainId } = useWeb3React<Web3Provider>();
  const { contracts, setContracts } = React.useContext(MyContext)

  React.useEffect(() => {
    if (!!library) {
      let signer = null
      if (typeof account !== 'undefined') signer = library.getSigner(account)

      const Game = getContract('GLXGame', signer || library);
      const Factory = getContract('GLXFactory', signer || library);
      const Router = getContract('GLXRouter', signer || library);
      const CDAI = getContract('CDAI', signer || library);
      const DAI = getContract('DAI', signer || library);
      const HOPE = getContract('HOPE', signer || library);
      setContracts({ DAI, Game, HOPE, Factory, Router, CDAI, CONTRACTS });
    }
  }, [account, library, chainId]);
  return (<></>)
}

export default Contracts