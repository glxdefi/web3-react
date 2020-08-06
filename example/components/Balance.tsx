
import React from 'react'
import {useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
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
        if (!stale) {
          setBalance(result)
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
      <span>{balance === null ? 'Error' : balance ? `Ξ${formatEther(balance)}` : ''}</span>
    </>
  )
}