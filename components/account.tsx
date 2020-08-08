import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Menu, Dropdown, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons';

export default function Account(props) {
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