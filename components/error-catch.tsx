import React from 'react'
import { useWeb3React, UnsupportedChainIdError } from  '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
import { message} from 'antd'

export default function ErrorCatch() {
  const { error } = useWeb3React()

  React.useEffect((): any => {
    if (error instanceof NoEthereumProviderError) {
      return message.error('没有检测到以太坊环境, 安装 MetaMask 或者在 dApp 浏览器中打开')
    }

    if (error instanceof UnsupportedChainIdError) {
      return message.error("当前网络不支持，请连接到 Ropsten 网络")
    }
    if (
      error instanceof UserRejectedRequestErrorInjected ||
      error instanceof UserRejectedRequestErrorWalletConnect ||
      error instanceof UserRejectedRequestErrorFrame
    ) {
      return message.error('请授权访问您的以太坊账户')
    }
    if (error) {
      console.error(error)
      return message.error('未知错误')
    }

  }, [error])
  return (<></>)
}