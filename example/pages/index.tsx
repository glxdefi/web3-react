import React, { FC } from 'react'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
import { Web3Provider } from '@ethersproject/providers'
import Balance from '../components/Balance'
import TokenInfo from '../components/TokenInfo'
import Approve from '../components/Approve'
import Transfer from '../components/Transfer'
import { Button, Alert, List, Divider, Spin, Statistic, Avatar, Card, Modal, Tag, Typography, notification, message, Space, Layout, Menu, Dropdown, Row, Col } from 'antd';
import { Provider, MyContext } from '../context'
const { Title, Text, Link } = Typography;
const { Countdown } = Statistic;
const { Header, Content, Footer } = Layout;
import { UserOutlined } from '@ant-design/icons';

import { useEagerConnect, useInactiveListener } from '../hooks'


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
} from '../connectors'
import { Spinner } from '../components/Spinner'
import Item from 'antd/lib/list/Item'

enum ConnectorNames {
  Injected = 'Injected',
  Network = 'Network',
  WalletConnect = 'WalletConnect',
  WalletLink = 'WalletLink',
  Ledger = 'Ledger',
  Trezor = 'Trezor',
  Frame = 'Frame',
  Authereum = 'Authereum',
  Fortmatic = 'Fortmatic',
  Portis = 'Portis',
  Squarelink = 'Squarelink',
  Torus = 'Torus'
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
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

function ErrorCatch() {
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

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}

function ChainId() {
  const { chainId } = useWeb3React()
  let tag: any;
  if (chainId == 1)
    tag = <Tag color="geekblue">主网</Tag>
  if (chainId == 3)
    tag = <Tag color="volcano">Ropsten</Tag>

  return (
    <>
      {chainId && tag}
    </>
  )
}

function BlockNumber() {
  const { chainId, library } = useWeb3React()

  const [blockNumber, setBlockNumber] = React.useState<number>()
  React.useEffect((): any => {
    if (!!library) {
      let stale = false
      library
        .getBlockNumber()
        .then((blockNumber: number) => {
          if (!stale) {
            setBlockNumber(blockNumber)
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null)
          }
        })

      const updateBlockNumber = (blockNumber: number) => {
        setBlockNumber(blockNumber)
      }
      library.on('block', updateBlockNumber)

      return () => {
        stale = true
        library.removeListener('block', updateBlockNumber)
        setBlockNumber(undefined)
      }
    }
  }, [library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Block Number</span>
      <span role="img" aria-label="numbers">
        🔢
      </span>
      <span>{blockNumber === null ? 'Error' : blockNumber ?? ''}</span>
    </>
  )
}

function Account(props) {
  const { account } = useWeb3React()
  const href = `https://ropsten.etherscan.io/address/${account}`
  const menu = (
    <Menu> <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href={href}>
        交易历史
      </a>
    </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" onClick={props.deactivate}>
          退出
      </a>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu}>
      <div style={{ height: '100%' }}>
        <span role="img" aria-label="robot">
          <Avatar size={32} icon={<UserOutlined />} />
        </span>
        <span>
          {account === null
            ? '-'
            : account
              ? `  ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
              : ''}
        </span>
      </div>
    </Dropdown>
  )
}
function TakeModal(props) {
  const { account, active} = useWeb3React<Web3Provider>()
  const [visible, setVisible] = React.useState<boolean>(false)
  const { setLoginModalVisible } = React.useContext(MyContext)
  const handleLogin = () => {
    if (!active){
      setLoginModalVisible(true)
    }else {
      setVisible(true)
    }
  }

  return <>
    <Button type="default" size='middle' onClick={handleLogin} style={{
      background: props.color,
      color: '#fff',
    }}>支持</Button>
  <Modal
    title="选择登录方式"
    visible={visible}
    footer={null}
    onCancel={() => {
      setVisible(false)
    }
    }>
    <div
      style={{
        display: 'grid',
        gridGap: '1rem',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '20rem',
        margin: 'auto'
      }}
    >
      xxxxxxx
  </div>
  </Modal>
  </>
}

function LoginModal(props) {
  const context = useWeb3React<Web3Provider>()
  const { loginModalVisible, setLoginModalVisible} = React.useContext(MyContext)
  const { connector, activate, error } = context

  const handleLogin = () => {
    setLoginModalVisible(true)
  } 

  return <>
    <Button type="primary" onClick={handleLogin}>连接钱包</Button>
    <Modal
      title="选择登录方式"
      visible={loginModalVisible}
      footer={null}
      onCancel={() => {
        setLoginModalVisible(false)
      }}
    >
      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '20rem',
          margin: 'auto'
        }}
      >
        {Object.keys(connectorsByName).map(name => {
          const currentConnector = connectorsByName[name]
          const activating = currentConnector === props.activatingConnector
          const connected = currentConnector === connector
          const disabled = !props.triedEager || !!props.activatingConnector || connected || !!error
          return (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
                cursor: disabled ? 'unset' : 'pointer',
                position: 'relative'
              }}
              disabled={disabled}
              key={name}
              onClick={() => {
                props.setActivatingConnector(currentConnector)
                activate(connectorsByName[name])
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                  margin: '0 0 0 1rem'
                }}
              >
                {activating && <Spinner color={'black'} style={{ height: '25%', marginLeft: '-1rem' }} />}
                {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )}
              </div>
              {name}
            </button>
          )
        })}
      </div>
    </Modal>
  </>
}

function HeaderComponent() {
  return (
    <>
      <h3
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr min-content 1fr',
          maxWidth: '20rem',
          lineHeight: '2rem',
          margin: 'auto'
        }}
      >
        <Balance />
        <BlockNumber />
        <TokenInfo address="0xad6d458402f60fd3bd25163575031acdce07538d" />

      </h3>
    </>
  )
}
function PendingTx() {
  const { pendings } = React.useContext(MyContext)
  console.log('pendings', pendings);
  const btns = pendings.map((item) => {
    return <Button type="link" href={'https://ropsten.etherscan.io/tx/' + item} target="_blank" size='small'>{item}</Button>
  })
  const spin = <Spin />
  return pendings.length > 0 && <Alert
    style={{ width: 600, margin: '0 auto' }}
    message="广播中的交易"
    description={btns}
    type="success"
    showIcon
    icon={spin}
  />
}
const App: FC = () => {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  const [loginModalVisible, setLoginModalVisible] = React.useState<any>(false)
  const [pendings, setPendings] = React.useState<string[]>([])

  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
  const teams = [{
    name: '川普',
    color: '#ff6666',
    img: './2.svg',
    amount: 1234.1,
    supported: 100,
  }, {
    name: '拜登',
    color: '#1890ff',
    img: './1.svg',
    amount: 3234.1,
    supported: 20,
  }]
  const redUsers = [{
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
  const APPContext = { setLoginModalVisible, loginModalVisible, pendings, setPendings }
  return (
    <Provider value={APPContext}>
      <Layout className="layout">
        <ErrorCatch />
        <Header className="header">
          <Row>
            <Col span={21}><div className="logo"><img src='logo.png' width="100" height="auto" style={{ padding: 20 }} /></div></Col>
            <Col span={1}><ChainId /></Col>
            <Col span={2} style={{
              textAlign: 'right'
            }}>
              {active ?
              (<Account deactivate={deactivate} />) :
              (error ? <Button danger onClick={() => {
                deactivate()
              }}>错误，断开连接</Button> : <LoginModal triedEager={triedEager} activatingConnector={activatingConnector} setActivatingConnector={setActivatingConnector} />)}
            </Col>
          </Row>

        </Header>
        <Content className="site-layout-backgroud">
          <div><Title>Winners Take All</Title></div>
          <div><Text type="secondary" style={{ fontSize: 32 }}>谁是下一届美国总统?</Text></div>
          <Row>
            {teams.map((item) => {
              return <Col span={24 / teams.length}>
                <Avatar src={item.img} size={150} style={{ margin: '30px 0' }} />
                <Title level={4}>{item.name}</Title>
              </Col>
            })}
          </Row>
          <div className="progressBar" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 600 * teams[0].amount / (teams[0].amount + teams[1].amount),
              height: 30,
              background: teams[0].color,
              borderRadius: '15px 0 0 15px'
            }}>
              <span style={{
                float: 'left',
                marginLeft: '10px'
              }}>{(teams[0].amount / (teams[0].amount + teams[1].amount) * 100).toFixed(2) + '%'}</span>
            </div>
            <div style={{
              width: 600 * teams[1].amount / (teams[0].amount + teams[1].amount),
              height: 30,
              background: teams[1].color,
              borderRadius: '0 15px 15px 0'
            }}>
              <span style={{
                float: 'right',
                marginRight: '10px'
              }}>{(teams[1].amount / (teams[0].amount + teams[1].amount) * 100).toFixed(2) + '%'}</span>
            </div>
          </div>
          <Row style={{ width: 600, margin: '0 auto' }}>
            <Col span={24 / teams.length}>

            </Col>
          </Row>
          <Row style={{ width: 600, margin: '0 auto' }}>
            {teams.map((item, index) => {
              return <Col span={24 / teams.length}>
                <Card bordered={false} style={{ width: 300, textAlign: !index ? 'left' : 'right' }}>
                  <span>已下注</span>
                  <Title level={2} style={{ color: item.color, marginTop: 0 }}>${item.amount}</Title>
                  {index == 0 ? <p>收益率: <span>{((teams[0].amount + teams[1].amount - item.amount) / item.amount * 100).toFixed(2)}%</span></p>
                    :
                    <p><span>{((teams[0].amount + teams[1].amount - item.amount) / item.amount * 100).toFixed(2)}%</span>: 收益率</p>}

                  {index == 0 ? <p>我已支持: <span>{item.supported}</span></p>
                    :
                    <p><span>{item.supported}</span>: 我已支持</p>}
                  <TakeModal color={item.color}/>
                </Card>
              </Col>
            })}
          </Row>

          <PendingTx />
          <div style={{ padding: '30px 0' }}><Countdown title="下注截止时间" value={new Date('2020-08-11 00:00:00').getTime()} format="HH:mm:ss:SSS" /></div>

          <Divider />

          <div style={{ paddingTop: 30 }}><Title level={3}>利息奖金</Title></div>
          <div><Title level={1} style={{ color: '#CC9933' }}>$332.1</Title></div>
          <div><Text type="secondary" style={{ fontSize: 16 }}>奖金来自 compound 生息</Text></div>
          <div><Text type="secondary" style={{ fontSize: 16 }}>正、反方下注最多的人各得 50% 奖金</Text></div>
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 50 }}>
            <List
              className="redList"
              size="large"
              header={<div style={{ color: '#fff', textAlign: 'left' }}>红队 Top10</div>}
              bordered
              dataSource={redUsers}
              style={{ width: 400 }}
              renderItem={(item, index) => <List.Item key={item.id}><Text>{item.address.substr(0, 6) + '...' + item.address.substr(item.address.length - 4, 4)}{index == 0 && <span style={{ fontSize: 30 }}>🏅</span>}</Text><Text style={{ fontSize: 16, color: '#ff6666' }}>{item.amount} DAI</Text></List.Item>}
            />

            <List
              className="blueList"
              size="large"
              header={<div style={{ color: '#fff', textAlign: 'left' }}>蓝队 Top10</div>}
              bordered
              dataSource={blueUsers}
              style={{ width: 400 }}
              renderItem={(item, index) => <List.Item key={index}><Text>{item.address.substr(0, 6) + '...' + item.address.substr(item.address.length - 4, 4)}{index == 0 && <span style={{ fontSize: 30 }}>🏅</span>}</Text><Text style={{ fontSize: 16, color: '#1890ff' }}>{item.amount} DAI</Text></List.Item>}
            />
          </div>
        </Content>
        <Content className="site-layout-backgroud">
          <HeaderComponent />
          <Approve address="0xad6d458402f60fd3bd25163575031acdce07538d" />
          <Transfer address="0xad6d458402f60fd3bd25163575031acdce07538d" />


          <div
            style={{
              display: 'grid',
              gridGap: '1rem',
              gridTemplateColumns: 'fit-content',
              maxWidth: '20rem',
              margin: 'auto'
            }}
          >
            {!!(library && account) && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  library
                    .getSigner(account)
                    .signMessage('👋')
                    .then((signature: any) => {
                      window.alert(`Success!\n\n${signature}`)
                    })
                    .catch((error: any) => {
                      window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
                    })
                }}
              >
                Sign Message
              </button>
            )}
            {!!(connector === connectorsByName[ConnectorNames.Network] && chainId) && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ; (connector as any).changeChainId(chainId === 1 ? 4 : 1)
                }}
              >
                Switch Networks
              </button>
            )}
            {connector === connectorsByName[ConnectorNames.WalletConnect] && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ; (connector as any).close()
                }}
              >
                Kill WalletConnect Session
              </button>
            )}
            {connector === connectorsByName[ConnectorNames.WalletLink] && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ; (connector as any).close()
                }}
              >
                Kill WalletLink Session
              </button>
            )}
            {connector === connectorsByName[ConnectorNames.Fortmatic] && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ; (connector as any).close()
                }}
              >
                Kill Fortmatic Session
              </button>
            )}
            {connector === connectorsByName[ConnectorNames.Portis] && (
              <>
                {chainId !== undefined && (
                  <button
                    style={{
                      height: '3rem',
                      borderRadius: '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      ; (connector as any).changeNetwork(chainId === 1 ? 100 : 1)
                    }}
                  >
                    Switch Networks
                  </button>
                )}
                <button
                  style={{
                    height: '3rem',
                    borderRadius: '1rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    ; (connector as any).close()
                  }}
                >
                  Kill Portis Session
            </button>
              </>
            )}
            {connector === connectorsByName[ConnectorNames.Torus] && (
              <button
                style={{
                  height: '3rem',
                  borderRadius: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  ; (connector as any).close()
                }}
              >
                Kill Torus Session
              </button>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>PowerBy 复仇者联盟</Footer>
      </Layout>
    </Provider>
  )
}
