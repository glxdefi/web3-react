import React, { FC } from 'react'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
import { ethers, BigNumber } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import Balance from '../components/Balance'
import TokenInfo from '../components/TokenInfo'
import Approve from '../components/Approve'
import Transfer from '../components/Transfer'
import { Button, Alert, Result, Form, Input, List, Divider, Spin, Statistic, Avatar, Card, Modal, Tag, Typography, notification, message, Space, Layout, Menu, Dropdown, Row, Col } from 'antd';
import { Provider, MyContext } from '../context'
import ERC20_ABI from '../components/erc20.abi.json'
const { Title, Text, Paragraph, Link } = Typography;
const { Countdown } = Statistic;
const { Header, Content, Footer } = Layout;
import { UserOutlined } from '@ant-design/icons';

import { useEagerConnect, useInactiveListener } from '../hooks'
const DAI_ADDRESS = '0xad6d458402f60fd3bd25163575031acdce07538d'


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
  const { account, active, library } = useWeb3React<Web3Provider>()
  const [takeModalVisible, setTakeModalVisible] = React.useState<boolean>(false)
  const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false)
  const {pendings, setPendings, setLoginModalVisible } = React.useContext(MyContext)
  const [myBalance, setMyBalance] = React.useState<string>('0')

  const handleLogin = () => {
    if (!active) {
      setLoginModalVisible(true)
    } else {
      setTakeModalVisible(true)
    }
  }
  const team = props.team;
  const onFinish = values => {
    console.log('Success:', values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };
  // 初始化 team 数据
  (async () => {
    if (!library || !account) return
    const contract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, library);

    const [name, symbol, balanceOf] = await Promise.all([
      contract.name(),
      contract.symbol(),
      account ? contract.balanceOf(account) : undefined,
    ]);
    const _myBalance = Number(ethers.utils.formatUnits(balanceOf)).toFixed(5)
    setMyBalance(_myBalance);
  })();
  const [form] = Form.useForm();
  const onOk = values => {
    setConfirmLoading(true);
    (async () => {
      try {
        await form.validateFields()
        const contract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, library.getSigner(account));
        let amount = ethers.utils.parseUnits(form.getFieldValue('amount'));
        const result = await contract.transfer('0x51BFd7AD73960f980Bcb8d932B894Bd2c4c233c6', amount)
        message.success('交易已广播：' + result.hash)
        const list = [...pendings, result.hash]
        setPendings(list)
        setConfirmLoading(false);
        setTakeModalVisible(false)
        const tx = await library.waitForTransaction(result.hash, 1, 120 * 1000) // 1个高度确认，等待 2 分钟
        const index = list.indexOf(tx.transactionHash)

        if (index !== -1) {
          list.splice(index, 1)
          message.success('交易成功 ！')
          setPendings([...list])
        }
      } catch (error) {
        setConfirmLoading(true);
        // @ts-ignore
        if (error && error.code === 4001) {
          return message.error('您已经取消了交易')
        }
      }
    })();
  };
  return <>
    <Button type="default" size='large' onClick={handleLogin} style={{
      background: team.color,
      color: '#fff',
    }}>支持</Button>
    <Modal
      title={'支持' + team.name}
      visible={takeModalVisible}
      okText='确定'
      cancelText='取消'
      confirmLoading={confirmLoading}
      onCancel={() => {
        setTakeModalVisible(false)
      }}
      onOk={onOk}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'left'
        }}
      >
        <Alert message="获胜后将瓜分对方奖金" type="success" />
        <Form
          wrapperCol={{ offset: 0, span: 24 }}
          name="basic"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          style={{ width: 400, padding: '30px 0' }}
        >
          <Form.Item label="余额">
            <span className="ant-form-text" style={{ fontSize: 16 }}>{myBalance}</span>
          </Form.Item>
          <Form.Item
            label="金额"
            name="amount"
            rules={[{ required: true, message: '至少输入 1 USDT' }]}
          >
            <Input addonAfter="USDT" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  </>
}

// 登录数据
function LoginModal(props) {
  const context = useWeb3React<Web3Provider>()
  const { loginModalVisible, setLoginModalVisible } = React.useContext(MyContext)
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
function SupportAmount(props) {
  const [takeDetail, setTakeDetail] = React.useState<any>(false)
  const { account, active, library } = useWeb3React<Web3Provider>()
  const contract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, library);

  return (
    <span>{takeDetail[props.teamName].support || 0}</span>
  )
}
// 队伍数据
function TEAMInfo() {
  const { teams, setTeams, pendings } = React.useContext(MyContext)
  const { account, active, library, chainId } = useWeb3React<Web3Provider>();

  React.useEffect(() => {
    // 初始化 team 数据
    (async () => {
      if (!library || !account) return
      const contract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, library);

      const _teams = [...teams]
      const [name, symbol, balanceOf] = await Promise.all([
        contract.name(),
        contract.symbol(),
        account ? contract.balanceOf(account) : undefined,
      ]);
      const amount = Number(ethers.utils.formatUnits(balanceOf)).toFixed(5)

      _teams[0].supported = amount
      setTeams(_teams);
    })();
  }, [pendings, account, library, chainId]);
  return (<div></div>)
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
  const btns = pendings.map((item, index) => {
    return <Button key={index} type="link" href={'https://ropsten.etherscan.io/tx/' + item} target="_blank" size='small'>{item}</Button>
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

function WinnerModal() {
  const { winnerModalVisible, setWinnerModalVisible } = React.useContext(MyContext)
  const { teams, setTeams, pendings } = React.useContext(MyContext)
  const { event, setEvent } = React.useContext(MyContext)
  console.log(event);
  if (event.winnerIndex == null) return (<></>);

  const loseIndex = event.winnerIndex ? 0 : 1;
  const win = teams[event.winnerIndex]
  const lose = teams[loseIndex]
  const redTop1 = '0xf40629b5F96567270794F0F29E55Ac9daDE14fFd'
  const blueTop1 = '0xf40629b5F96567270794F0F29E55Ac9daDE14fFd'

  const handleOk = e => {
    setWinnerModalVisible(false)
  };

  const handleCancel = e => {
    setWinnerModalVisible(false)
  };
  let state = 0
  React.useEffect(() => {
    if (event.winnerIndex != null && state == 0) {
      state = 1
      setWinnerModalVisible(true)
    }
  }, [])

  return (
    <Modal
      title="已开奖"
      visible={winnerModalVisible}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
      bodyStyle={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', paddingBottom: 50 }}
    >
      <Avatar src={win.img} size={100} style={{ margin: '30px auto' }} />
      <Title level={3} style={{ textAlign: 'center' }}>{`选 ${win.name} 的获胜`}</Title>
      <Row style={{ padding: '30px 0' }}>
        <Col span={12}>      <Statistic title="瓜分奖金" value={lose.amount} precision={2} />
        </Col>
        <Col span={12}>      <Statistic title="利息奖金" value={event.income} precision={2} />
        </Col>
      </Row>
      <div>红队 Top1: <Button type="link" href={'https://ropsten.etherscan.io/address/' + redTop1} target="_blank" size='small'>{redTop1}</Button> </div>
      <div>蓝队 Top1: <Button type="link" href={'https://ropsten.etherscan.io/address/' + redTop1} target="_blank" size='small'>{blueTop1}</Button> </div>
    </Modal>
  )
}

const App: FC = () => {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  const [loginModalVisible, setLoginModalVisible] = React.useState<any>(false)
  const [pendings, setPendings] = React.useState<string[]>([])
  const [event, setEvent] = React.useState<{ income: number, winnerIndex: any }>({ income: 1, winnerIndex: null })  // 活动数据
  const [winnerModalVisible, setWinnerModalVisible] = React.useState<boolean>(false)
  const [teams, setTeams] = React.useState<{ name: string, img: string, amount: number, color: string, supported: number }[]>(
    [{
      name: '川普',
      color: '#ff6666',
      img: './2.svg',
      amount: 1,
      supported: 0,
    }, {
      name: '拜登',
      color: '#1890ff',
      img: './1.svg',
      amount: 1,
      supported: 0,
    }]
  );

  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
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
  const APPContext = { setLoginModalVisible, loginModalVisible, pendings, setPendings, teams, setTeams, event, setEvent, winnerModalVisible, setWinnerModalVisible }
  return (
    <Provider value={APPContext}>
      <Layout className="layout">
        <ErrorCatch />
        <WinnerModal />
        <Header className="header">
          <Row>
            <Col span={10}><Title level={2} style={{padding: '20px 0'}}>你猜,我猜不猜</Title></Col>
            <Col span={11}></Col>
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
        <TEAMInfo />

        <Content className="site-layout-backgroud">
          <div><Title>谁是下一届美国总统?</Title></div>
          <div><Text type="secondary" style={{ fontSize:  20 }}>胜者赢得对手方的奖金，下注最多的人平分利息奖金</Text></div>
          <Row>
            {teams.map((item, index) => {
              return <Col key={index} span={24 / teams.length}>
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
              return <Col key={index} span={24 / teams.length}>
                <Card bordered={false} style={{ width: 300, textAlign: !index ? 'left' : 'right' }}>
                  <span>已下注</span>
                  <Title level={2} style={{ color: item.color, marginTop: 0 }}>${item.amount}</Title>
                  {index == 0 ? <p>收益率: <span>{((teams[0].amount + teams[1].amount - item.amount) / item.amount * 100).toFixed(2)}%</span></p>
                    :
                    <p><span>{((teams[0].amount + teams[1].amount - item.amount) / item.amount * 100).toFixed(2)}%</span>: 收益率</p>}

                  {active ? (index == 0 ? <p>我已支持: <span>{item.supported}</span></p>
                    :
                    <p><span>{item.supported}</span>: 我已支持</p>) : ''}
                  {event.winnerIndex == null && <TakeModal team={item} />}
                </Card>
              </Col>
            })}
          </Row>
          {event.winnerIndex != null &&
            <Button type='default' size='large' onClick={() => { setWinnerModalVisible(true) }}>开奖详情</Button>}
          {event.winnerIndex == null && <div>
            <PendingTx />
            <div style={{ padding: '30px 0' }}><Countdown title="下注截止时间" value={new Date('2020-08-11 00:00:00').getTime()} format="HH:mm:ss:SSS" /></div>
          </div>
          }
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
              renderItem={(item, index) => <List.Item key={index}><Text>{item.address.substr(0, 6) + '...' + item.address.substr(item.address.length - 4, 4)}{index == 0 && <span style={{ fontSize: 30 }}>🏅</span>}</Text><Text style={{ fontSize: 16, color: '#ff6666' }}>{item.amount} DAI</Text></List.Item>}
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
        <Content className="site-layout-backgroud-intro">
          <div style={{ paddingTop: 30,textAlign:'center' }}><Title>HOPE TOKEN</Title></div>
          <div style={{ textAlign: 'center', paddingBottom: 30 }}><Text type="secondary" style={{ fontSize: 20}}>小赌一把，即做平台股东</Text></div>
          <Title level={4}>平台币简介</Title>
          <Paragraph>
            1. 下注任意数量 DAI，即获得 HOPE TOKEN <br/>
            2. 发行总量固定：1 亿。不预挖，不增发<br />
            3. 按照下注数量，发行递减。 <br />
            4. 铸币公式：= 下注DAI / ((log2^已存入DAI总量) + 1)
          </Paragraph>
          <Title level={4}>收益</Title>
          <Paragraph>
            1. 对于每场对赌，平台收取收益的 3% <br />
            2. 所有持有 HOPE 的用户可以分享 3% 收益<br />
          </Paragraph>
          <Title level={4}>流动性挖矿</Title>
          <Paragraph>
            1. 参与 Pool2，提供流动性，获得 BPT，用户 BPT staking <br />
            2. Pool2 给所有持有 BPT 的用户每个高度发收益<br />
            3. 在 Pool2 ，买入或者卖出 HOPE，获得 DAI<br />
            4. 继续拿 DAI 去下注
          </Paragraph>
        </Content>
        <Content className="site-layout-backgroud">
          <HeaderComponent />
          <Approve address={DAI_ADDRESS} />
          <Transfer address={DAI_ADDRESS} />


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
        <Footer style={{ textAlign: 'center' }}><img src='logo2.png' width="200" height="100" /></Footer>
      </Layout>
    </Provider>
  )
}