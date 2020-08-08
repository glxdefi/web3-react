import React, { FC } from 'react'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { ethers, BigNumber } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Button, Alert, Form, Input, List, Divider, Spin, Statistic, Avatar, Card, Modal, Tag, Typography, notification, message, Space, Layout, Menu, Dropdown, Row, Col } from 'antd';
import {MyContext} from '../context'

// 弹框发交易
export default function TakeModal(props) {
  const { account, active, library } = useWeb3React<Web3Provider>()
  const [takeModalVisible, setTakeModalVisible] = React.useState<boolean>(false)
  const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false)
  const { pendings, setPendings, setLoginModalVisible, game } = React.useContext(MyContext)
  const [myBalance, setMyBalance] = React.useState<string>('0')
  const { contracts } = React.useContext(MyContext)

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
  // 获取余额
  (async () => {
    if (!library || !account || !contracts['DAI']) return
    const contract = contracts['DAI']
    const [balanceOf] = await Promise.all([
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
        const contract = contracts['Router']
        let amount = ethers.utils.parseUnits(form.getFieldValue('amount'));
        const result = await contract.bet(contracts.Game.address, team.direction, amount,{gasLimit: 1000000})  // 投票
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
        return message.error(error.message)
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
        setConfirmLoading(false);
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
            <span className="ant-form-text" style={{ fontSize: 16 }} >{myBalance}</span>
          </Form.Item>
          <Form.Item
            label="金额"
            name="amount"
            rules={[{ required: true, message: '至少输入 0.1 DAI' }]}
          >
            <Input addonAfter="DAI" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  </>
}