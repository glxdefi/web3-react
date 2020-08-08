
import React from 'react'
import {useWeb3React } from '@web3-react/core'
import { ethers, BigNumber, FixedNumber } from 'ethers'

import { MyContext } from '../context'

export default function Balance() {
  const { account, library, chainId } = useWeb3React()
  // const context = React.useContext(MyContext)
  // console.log('xxx context', context)
  const [balance, setBalance] = React.useState()

  React.useEffect(() => {
    (async () => {
      if (!!account && !!library) {
        let stale = false
        const result = await library.getBalance(account)
        const amount = Number(ethers.utils.formatUnits(result)).toFixed(5)

        if (!stale) {
          // @ts-ignore
          setBalance(amount)
        }
        return () => {
          stale = true
          setBalance(undefined)
        }
      }

    })()
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Balance</span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>{balance === null ? 'Error' : balance ? `Ξ${balance}` : ''}</span>
    </>
  )
}