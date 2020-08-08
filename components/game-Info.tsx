

import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core'
import ethers, { BigNumber } from 'ethers'
import { MyContext } from '../context'
import { formatUnits, formatEther} from '../utils'

let timeref = null;
// 队伍数据
function GameInfo() {
  const { game, setGame, pendings, contracts } = React.useContext(MyContext)
  const { account, active, library, chainId } = useWeb3React<Web3Provider>();
 
  const getGameInfo = async (c, d) => {
    const [isGameResultOpen, isOnChainGame, gameObjectToken, gameObjectTokenSupply,
      trueTotalAmount, falseTotalAmount, trueTotalCount, falseTotalCount, maxAmount,
      maxAmountAccount, daiCurrent,
      startBlockNumber,
      endBlockNumber,
      getBlockNumber, trueAmountMap, falseAmountMap
    ] = await Promise.all([
      c.isGameResultOpen(),
      c.isOnChainGame(),
      c.gameObjectToken(),
      c.gameObjectTokenSupply(),
      c.trueTotalAmount(),
      c.falseTotalAmount(),
      c.trueTotalCount(),
      c.falseTotalCount(),
      c.maxAmount(),
      c.maxAmountAccount(),
      d?.totalSupply(),
      c.startBlockNumber(),
      c.endBlockNumber(),
      library.getBlockNumber(),
      c.trueAmountMap(account),
      c.falseAmountMap(account),
    ]);
    let _endBlockNumber = Number(endBlockNumber.toString())
    const gameInfo = {
      isGameResultOpen,
      isOnChainGame,
      gameObjectToken,
      gameObjectTokenSupply: gameObjectTokenSupply.toString(),
      daiCurrent: formatUnits(daiCurrent),
      maxAmount: formatUnits(maxAmount),
      maxAmountAccount,
      leftHeight: (getBlockNumber > _endBlockNumber) ? 0 : (_endBlockNumber - getBlockNumber),
      startBlockNumber: formatUnits(startBlockNumber,'wei'),
      endBlockNumber: formatUnits(endBlockNumber, 'wei'),
      blockHeight: getBlockNumber,
      teamRed: {
        name: `能`,
        color: '#ff6666',
        img: './2.svg',
        amount: formatUnits(trueTotalAmount),
        supported: formatEther(trueAmountMap),
        userCount: trueTotalCount.toString(),
        direction: true
      },
      teamBlue: {
        name: `不能`,
        color: '#1890ff',
        img: './1.svg',
        amount: formatUnits(falseTotalAmount),
        supported: formatEther(trueAmountMap),
        userCount: falseTotalCount.toString(),
        direction: false
      }
    }
    console.log(gameInfo);
    setGame(gameInfo);
  }
  React.useEffect(() => {
    // 初始化 team 数据
    (async () => {
      const c = contracts['Game'];
      const d = contracts.DAI

      if (!library || !c) return
      getGameInfo(c, d)
      if (timeref)  {
        clearInterval(timeref)
      }
     timeref = setInterval(() => getGameInfo(c,d), 30*1000)
      
    })();
  }, [pendings, account, library, chainId, contracts]);
  return (<div></div>)
}
export default GameInfo