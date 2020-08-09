import React, { FC } from 'react'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Approve, TokenInfo, Transfer, GameInfo,  ErrorCatch, 
  Account, WinnerModal, TakeModal, LoginModal } from '../components'
import { Button, Alert, Divider, Spin, Statistic, Avatar, Card, Progress, Tag, Typography, notification, message, Space, Layout, Menu, Dropdown, Row, Col } from 'antd';
import { Provider, MyContext } from '../context'
import Contracts from '../services/contracts'
import { useEagerConnect, useInactiveListener } from '../hooks'
import { ConnectorNames } from '../types'
import { connectorsByName, redUsers } from '../constants'
import { BlockOutlined, DollarCircleOutlined, RocketOutlined } from '@ant-design/icons';



const { Title, Text, Paragraph, Link } = Typography;
const { Countdown } = Statistic;
const { Header, Content, Footer } = Layout;


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
        <TokenInfo />
        <Contracts />
        <ErrorCatch />
        <WinnerModal />
        <GameInfo />
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

const App: FC = () => {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  const [loginModalVisible, setLoginModalVisible] = React.useState<any>(false)
  const [pendings, setPendings] = React.useState<string[]>([])
  const [contracts, setContracts] = React.useState<string[]>([])
  const [tokenDetails, setTokenDetails] = React.useState<Object>({
    HopeBalanceOf:0, totalSupply:0
  });
  const [winnerModalVisible, setWinnerModalVisible] = React.useState<boolean>(true)
  const [game, setGame] = React.useState<Object>({
    isGameResultOpen: false,
    isOnChainGame: true,
    gameObjectToken: undefined,
    gameObjectTokenSupply: 0,
    teamRed: {},
    teamBlue:{}
  }) //有game


  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
    
  }, [activatingConnector, connector])


  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
  
  const APPContext = { setLoginModalVisible, loginModalVisible, pendings, setPendings, winnerModalVisible, setWinnerModalVisible, 
    contracts, setContracts, game, setGame, tokenDetails, setTokenDetails}
  const redWidth = 700 * game.teamRed.amount / (+game.teamRed.amount + +game.teamBlue.amount) || 700/2;
  const blueWidth = 700 * game.teamBlue.amount / (+game.teamRed.amount + +game.teamBlue.amount) || 700 / 2;

  return (
    <Provider value={APPContext}>
      <Layout className="layout">

        <Header className="header">
          <Row>
            <Col span={10}><Title level={2} style={{padding: '20px 0'}}></Title></Col>
            <Col span={1} offset={11}><ChainId /></Col>
            <Col span={2} style={{
              textAlign: 'right'
            }}>
              { active ?
                (<Account deactivate={deactivate} />) :
                (error ? <Button danger onClick={() => {
                  deactivate()
                }}>错误，断开连接</Button> : <LoginModal triedEager={triedEager} activatingConnector={activatingConnector} setActivatingConnector={setActivatingConnector} />)
              }
            </Col>
          </Row>
        </Header>
        <Content className="site-layout-backgroud">
          <div><Title style={{fontSize: 64}}>预言市场</Title></div>
          <div><Text type="secondary" style={{ fontSize:  24 }}>指定块高能否达到目标发行量？</Text></div>
        
          <div style={{ padding: '15px 0' }}>
          </div>
          <Row gutter={24} style={{ marginTop: 20}} >
            <Col span={8}>
              <Text>竞猜 Token</Text>
              <div ><Button type="link" href={'https://ropsten.etherscan.io/address/' + game.gameObjectToken} target="_blank" size='small' style={{lineHeight: '40px', fontSize: 20}}>DAI</Button></div>
            </Col>
            <Col span={8}>
              <Statistic title="目标" value={game.gameObjectTokenSupply || 0} precision={2} />
            </Col>
            <Col span={8}>
              <Statistic title="当前发行量" value={game.daiCurrent} />
              {/* <Progress type="circle" percent={75} width={60} /> */}
            </Col>
          </Row>
         
        </Content>
        <div style={{ width: 1100,textAlign: 'center', margin: '0 auto'}}>
          <Row gutter={16} >
            <Col span={6}>
              <span>当前高度：</span><span>{game.blockHeight}</span>
            </Col>
            <Col span={6}>
              <span>下注截止块高：</span><span>{game.startBlockNumber}</span>
            </Col>
            <Col span={6}>
              <span>开奖块高：</span><span>{game.endBlockNumber}</span>
            </Col>
            <Col span={6}>
              <span>剩余块高：</span>{game.leftHeight}
            </Col>
          </Row>
        </div>
        <Content className="site-layout-backgroud">
          <div><Title level={2}>谁赢得奖金？</Title></div>
          <Row>
            <Col span={4} offset={4}>
              <img src={game.teamRed.img} style={{ width: 150, height: 130, margin: '30px 0' }} />
              <Title level={4} style={{paddingTop:20}}>{game.teamRed.name}</Title>
            </Col>
            <Col  span={8}>
              <img src="vs.png" width="200" alt="" style={{marginTop: 30}} />
            </Col>
            <Col span={4}>
              <img src={game.teamBlue.img} style={{ width: 150, height: 150, margin: '30px 0' }} />
              <Title level={4}>{game.teamBlue.name}</Title>
            </Col>
          </Row>
          <div className="progressBar" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: redWidth,
              height: 30,
              background: game.teamRed.color,
              borderRadius: '15px 0 0 15px'
            }}>
              <span style={{
                float: 'left',
                marginLeft: '10px'
              }}>{(game.teamRed.amount / (game.teamRed.amount + game.teamBlue.amount) * 100).toFixed(2) + '%'}</span>
            </div>
            <div style={{
              width: blueWidth,
              height: 30,
              background: game.teamBlue.color,
              borderRadius: '0 15px 15px 0'
            }}>
              <span style={{
                float: 'right',
                marginRight: '10px'
              }}>{(game.teamBlue.amount / (game.teamRed.amount + game.teamBlue.amount) * 100).toFixed(2) + '%'}</span>
            </div>
          </div>

          <Row style={{ width: 600, margin: '0 auto' }}>
            {game.gameObjectToken && [game.teamRed,game.teamBlue].map((item, index) => {
              const other = index == 1 ? 0 : 1
              const sum = [game.teamRed, game.teamBlue][other].amount
              const earnings = item.amount && sum && (sum / item.amount * 100).toFixed(2) || 0
              return <Col key={index} span={12}>
                <Card bordered={false} style={{ width: 300, textAlign: !index ? 'left' : 'right' }}>
                  <span>已下注</span>
                  <Title level={2} style={{ color: item.color, marginTop: 0 }}>${item.amount}</Title>
                  { index == 0 ? 
                    <p>收益率: <span style={{fontSize: 20}}>{earnings}%</span></p>
                    :
                    <p><span style={{ fontSize: 20 }}>{earnings}%</span>: 收益率</p>
                  }
                  {index == 0 ?
                    <p>参与人数: <span style={{ fontSize: 20 }}>{item.userCount}</span></p>
                    :
                    <p><span style={{ fontSize: 20 }}>{item.userCount}</span>: 参与人数</p>
                  }
                  { active ? 
                    (index == 0 ? 
                      <p>我已支持: <span style={{ fontSize: 20 }}>{item.supported}</span></p>
                      :
                      <p><span style={{ fontSize: 20 }}>{item.supported}</span>: 我已支持</p>)
                    : ''
                  }
                  {!game.isGameResultOpen && game.leftHeight != 0 &&  <TakeModal team={item} />}
                </Card>
              </Col>
            })}
          </Row>
          {game.isGameResultOpen &&
            <Button type='primary' size='large' onClick={() => { setWinnerModalVisible(true) }}>开奖详情</Button>}
          <div>
            <PendingTx />
          </div>
          
          <Divider />

          <div style={{ paddingTop: 30 }}><Title level={3}>锦鲤大奖</Title></div>
          <div><Text type="secondary" style={{ fontSize: 16 }}>奖金来自 compound 生息, 下注最多的人将获得奖金</Text></div>
          <div><Title style={{ color: '#CC9933', padding: 15, fontSize: 64 }}>$666</Title></div>
          <div style={{ height: 100 }}>              
            <Row style={{ marginTop: 20 }} >
              <Col span={6} offset={6}>
                <Text>当前 TOP1</Text>
                {game.maxAmountAccount && <div style={{lineHeight:'50px'}}><Button type="link" href={'https://ropsten.etherscan.io/address/' + game.maxAmountAccount} target="_blank" size='small'>{game.maxAmountAccount.substr(0, 6) + '...' + game.maxAmountAccount.substr(game.maxAmountAccount.length - 4, 4)}</Button></div>}
              </Col>
              <Col span={6}>
                {game.maxAmount && <Statistic title="下注金额：" value={game.maxAmount} />}
              </Col>
            </Row>
          </div>
        </Content>
        <Content className="site-layout-backgroud-intro">
          <div style={{ paddingTop: 30,textAlign:'center' }}><Title>HOPE TOKEN</Title></div>
          <div style={{ textAlign: 'center', paddingBottom: 30 }}><Text type="secondary" style={{ fontSize: 20}}>持有 HOPE 即可分红</Text></div>
          <Row gutter={24} style={{ marginBottom: 40 }} >
            <Col span={6} offset={8}>
              <Statistic title="Hope 发行量" value={tokenDetails.totalSupply || 0} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="我的 HOPE" value={tokenDetails.HopeBalanceOf || 0} />
            </Col>
          </Row>
          {
            [{
                title: '平台币简介',
                icon: BlockOutlined,
              desc: <Paragraph>
                  1. 下注任意数量 DAI，即获得 HOPE TOKEN <br />
                  2. 发行总量固定：1 亿。不预挖，不增发<br />
                  3. 按照下注数量，发行递减。 <br />
                  4. 铸币公式：= 下注DAI / ((log2^已存入DAI总量) + 1)
                  </Paragraph>
              },
              {
                title: '收益',
                icon: DollarCircleOutlined,
                desc: <Paragraph> 
                  1. 对于每场对赌，平台收取收益的 3% <br />
                  2. 所有持有 HOPE 的用户可以分享 3% 收益<br />
                </Paragraph>
              }, {
                title: '流动性挖矿',
                icon: RocketOutlined,
                desc: <Paragraph>
                  1. 参与 Pool2，提供流动性，获得 BPT，用户 BPT staking <br />
                  2. Pool2 给所有持有 BPT 的用户每个高度发收益<br />
                  3. 在 Pool2 ，买入或者卖出 HOPE，获得 DAI<br />
                  4. 继续拿 DAI 去下注，获得 HOPE，获得
                </Paragraph>
              }].map((item,index) => {
                return (
                  <Row key={index} style={{ marginTop: 10 }}>
                    <Col span={4} offset={2}>
                      <item.icon style={{fontSize: 70}} />
                    </Col>
                    <Col span={12} >
                    <Title level={4}>{item.title}</Title>
                      <Paragraph>
                        {item.desc}
                      </Paragraph>
                    </Col>
                  </Row>
                )
              })
          }
        </Content>
        <HeaderComponent />
        <Approve />
          <div
         
          >
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
        <Footer style={{ textAlign: 'center' }}><img src='logo2.png' width="200" height="100" /></Footer>
      </Layout>
    </Provider>
  )
}
