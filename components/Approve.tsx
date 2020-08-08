
import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import {useWeb3React } from '@web3-react/core'

import { Form, message, Button } from 'antd';

import { MyContext } from '../context'

function Approve({ address }: { address?: string }) {
  const { library, account, chainId} = useWeb3React<Web3Provider>();
  const { contracts } = React.useContext(MyContext)

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 4 },
  };
  const tailLayout = {
    wrapperCol: { offset: 4, span: 4 },
  };



  const onFinish = values => {
    const c = contracts['DAI']
    console.log(c);
    // let amount = ethers.utils.parseUnits(values.amount);
      (async () => {
        try {
          const result = await c.approve(contracts.CONTRACTS.GLXRouter.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
          message.success('交易已广播：' + result.hash)
          const tx = await library.waitForTransaction(result.hash, 1 ,120 * 1000) // 1个高度确认，等待 2 分钟
          console.log(tx);
          message.success('Approve Success')
        } catch (error) {
          // @ts-ignore
          if (error && error.code === 4001) {
            return message.error('您已经取消了交易授权')
          }
        }
      })();
    };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      {...layout}
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Approve
        </Button>
      </Form.Item>
    </Form>
  );
}

export default Approve;