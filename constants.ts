import { ConnectorNames } from './types'
import {
  injected,
  network,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  authereum,
  fortmatic,
  portis,
  squarelink,
  torus
} from './connectors'


export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.WalletLink]: walletlink,
  [ConnectorNames.Ledger]: ledger,
  [ConnectorNames.Trezor]: trezor,
  [ConnectorNames.Frame]: frame,
  [ConnectorNames.Authereum]: authereum,
  [ConnectorNames.Fortmatic]: fortmatic,
  [ConnectorNames.Portis]: portis,
  [ConnectorNames.Squarelink]: squarelink,
  [ConnectorNames.Torus]: torus
}

export const redUsers = [{
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}]
const blueUsers = [{
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}, {
  address: '0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6',
  amount: 123.12345,
}]