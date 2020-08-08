import React from 'react'
import { Statistic, Col, Row, Avatar, Modal, Button, Typography } from 'antd'
import { MyContext } from '../context'

const { Title } = Typography


export default function WinnerModal() {
  const { winnerModalVisible, setWinnerModalVisible, teams, setTeams, pendings, event, setEvent } = React.useContext(MyContext)
  if (event.winnerIndex == null) return (<></>);

  const loseIndex = event.winnerIndex ? 0 : 1;
  const win = teams[event.winnerIndex]
  const lose = teams[loseIndex]
  const top = '0xf40629b5F96567270794F0F29E55Ac9daDE14fFd'

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
      <div>锦鲤 : <Button type="link" href={'https://ropsten.etherscan.io/address/' + top} target="_blank" size='small'>{top}</Button> </div>
    </Modal>
  )
}