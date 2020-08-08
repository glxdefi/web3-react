

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
      interestIncome:0,
      shareHolderProfit: 0,
      winPrincipalProfit: 0,
      gameResult: null,
      isExistIncomeNeedReceive: false,
      getIncomeAmount:0,
      isReceivedMap: true,
      teamRed: {
        name: `大于目标值`,
        color: '#ff6666',
        img: './3.png',
        amount: formatUnits(trueTotalAmount),
        supported: formatEther(trueAmountMap),
        userCount: trueTotalCount.toString(),
        direction: true
      },
      teamBlue: {
        name: `小于目标值`,
        color: '#1890ff',
        img: './4.png',
        amount: formatUnits(falseTotalAmount),
        supported: formatEther(falseAmountMap),
        userCount: falseTotalCount.toString(),
        direction: false
      }
    }
    if (isGameResultOpen) {
      const [interestIncome, shareHolderProfit, winPrincipalProfit, gameResult, isExistIncomeNeedReceive, getIncomeAmount, isReceivedMap] = await Promise.all([
        c.interestIncome(),
        c.shareHolderProfit(),
        c.winPrincipalProfit(),
        c.gameResult(),
        c.isExistIncomeNeedReceive(account),
        c.getIncomeAmount(account),
        c.isReceivedMap(account)  // 是否已经领取 false表示未领取，true表示已经领取
      ])
      console.log('isExistIncomeNeedReceive', isExistIncomeNeedReceive, isReceivedMap);
      gameInfo.interestIncome = formatUnits(interestIncome)
      gameInfo.shareHolderProfit = formatUnits(shareHolderProfit)
      gameInfo.winPrincipalProfit = formatUnits(winPrincipalProfit)
      gameInfo.getIncomeAmount = formatUnits(getIncomeAmount)
      gameInfo.gameResult = gameResult
      gameInfo.isExistIncomeNeedReceive = isExistIncomeNeedReceive && !isReceivedMap  //是否存在可提取收益
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
     timeref = setInterval(() => getGameInfo(c,d), 60*1000)
      
    })();
  }, [pendings, account, library, chainId, contracts]);
  return (<div></div>)
}
export default GameInfo