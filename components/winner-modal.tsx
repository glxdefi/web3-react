import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core'
import { Statistic, Col, Row, Avatar, Modal, message, Typography } from 'antd'
import { MyContext } from '../context'

const { Title } = Typography


export default function WinnerModal() {
  const context = useWeb3React<Web3Provider>()
  const { winnerModalVisible, setWinnerModalVisible, setPendings, contracts, pendings,game } = React.useContext(MyContext)
  const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false)

  const { account, library } = context

  // if (game.gameResult == null) return (<></>);  // for test

  const c = contracts['Game'];

  const win = game.gameResult == true ? game.teamRed : game.teamBlue
  const handleOk = e => {
    setConfirmLoading(true);
    (async () => {
      try {
        const result = await c.receiveIncome(account)
        message.success('交易已广播：' + result.hash)
        const list = [...pendings, result.hash]
        setPendings(list)
        setConfirmLoading(false);
        setWinnerModalVisible(false)
        const tx = await library.waitForTransaction(result.hash, 1, 120 * 1000) // 1个高度确认，等待 2 分钟
        const index = list.indexOf(tx.transactionHash)
        if (index !== -1) {
          list.splice(index, 1)
          message.success('交易成功 ！')
          setPendings([...list])
        }
      } catch (error) {
        setConfirmLoading(false);
        // @ts-ignore
        if (error && error.code === 4001) {
          return message.error('您已经取消了交易')
        }
      }
    })();
  };

  const handleCancel = e => {
    setWinnerModalVisible(false)
  };

  return (
    <Modal
      title="已开奖"
      visible={winnerModalVisible}
      onOk={handleOk}
      footer={game.isExistIncomeNeedReceive}
      okText='提取我的收益'
      onCancel={handleCancel}
      bodyStyle={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', paddingBottom: 50 }}
    >
      <Avatar src={win.img} size={100} style={{ margin: '10px auto' }} />
      <Title level={3} style={{ textAlign: 'center' }}>{`选 ${win.name} 的获胜`}</Title>
      <Row style={{ padding: '30px 0' }}>
        <Col span={8}>      <Statistic title="瓜分奖金" value={game.winPrincipalProfit} precision={2} />
        </Col>
        <Col span={8}>      <Statistic title="Hope股东收益" value={game.shareHolderProfit} precision={2} />
        </Col>
        <Col span={8}>      <Statistic title="Top1 锦鲤奖金" value={game.interestIncome} precision={2} />
        </Col>
      </Row>
    </Modal>
  )
}