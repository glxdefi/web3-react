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
const infura = 'https://ropsten.infura.io/v3/404b78d3e9364b79921c39a8ea909b1c'

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
    address: "0x4f25a03e1d54eeab15cbffc058a60b797253f789", abi: GLXGame.abi
  }
}
// - Game1（明天demo 押注）: 0x4f25a03e1d54eeab15cbffc058a60b797253f789
// - Game2（测试 提取收益）: 0xaf1534cbD8571bE3b9Fa440A68a7E59CeFF2bde7
// - Game3（明天demo 提取收益）: 0xb91211a4e0d04b77a9949df69f8ac0b85084ec87

function getContract(name, web3): ethers.Contract {
  return new ethers.Contract(CONTRACTS[name]['address'], CONTRACTS[name]['abi'], web3);
}


const Contracts = function () {
  const { library, account, chainId } = useWeb3React<Web3Provider>();
  const { contracts, setContracts } = React.useContext(MyContext)
  function getLibrary() {
    return library || new ethers.providers.JsonRpcProvider(infura)
  }
  React.useEffect(() => {
    let signer = null
    if (!!library) {
      signer = library
      if (typeof account !== 'undefined') signer = library.getSigner(account)
    }else {
      signer = new ethers.providers.JsonRpcProvider(infura)
    }
    const Game = getContract('GLXGame', signer);
    const Factory = getContract('GLXFactory', signer);
    const Router = getContract('GLXRouter', signer);
    const CDAI = getContract('CDAI', signer);
    const DAI = getContract('DAI', signer);
    const HOPE = getContract('HOPE', signer);
    setContracts({ DAI, Game, HOPE, Factory, Router, CDAI, CONTRACTS, getLibrary})
  }, [account, library, chainId]);
  return (<></>)
}

export default Contracts