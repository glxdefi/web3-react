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
  "HOPE": {
    address: "0xC2242d5135b8bF97079AD9A198358F9c3361f6f1", abi: ERC20_ABI.abi },
  "DAI": {
    address: "0x21717B701dec71178fb0dad4886bfE319E935823", abi: DAI.abi
  },
  "CDAI": {
    address: "0x55b9F1f0c30d5E5c35E45d0F418a1d89bE9557D8", abi: DAI.abi
  },
  "GLXRouter": {
    address: "0x64E1FbDE3a56d49C766e4F8Bb6f638f60b0aD91C", abi: GLXRouter.abi
  },
  "GLXFactory": {
    address: "0x213f526876932CE71CE264d242977b0076E93eE4", abi: GLXFactory.abi
  },
  "GLXGame": {
    address: "0xaf1534cbD8571bE3b9Fa440A68a7E59CeFF2bde7", abi: GLXGame.abi
  }
}
  // 押注： 0x4f25a03e1d54eeab15cbffc058a60b797253f789
// - Game2（demo提取收益）: 0x461047A961Dff529CAa0Ed4503916d30ec8EDbFa

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