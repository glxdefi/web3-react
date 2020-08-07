
import React from 'react'
import { Web3Provider } from '@ethersproject/providers';
import {useWeb3React } from '@web3-react/core'
import { formatEther } from '@ethersproject/units'
import { ethers, BigNumber, FixedNumber} from 'ethers'
import { Form, Input, message, Button, Modal } from 'antd';

import { MyContext } from '../context'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ERC20_ABI = require('./erc20.abi.json');

function Approve({ address }: { address: string }) {
  const { library, account, chainId} = useWeb3React<Web3Provider>();

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 4 },
  };
  const tailLayout = {
    wrapperCol: { offset: 4, span: 4 },
  };



  const onFinish = values => {
    const contract = new ethers.Contract(address, ERC20_ABI, library.getSigner(account));
    // let amount = ethers.utils.parseUnits(values.amount);
      (async () => {
        try {
          const result = await contract.approve('d719c34261e099fdb33030ac8909d5788d3039c4', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
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