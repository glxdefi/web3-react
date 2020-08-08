import React, { FC } from 'react'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { ethers, BigNumber } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Button, Alert, Form, Input, List, Divider, Spin, Statistic, Avatar, Card, Modal, Tag, Typography, notification, message, Space, Layout, Menu, Dropdown, Row, Col } from 'antd';
import { MyContext } from '../context'
import { connectorsByName } from '../constants'
import Spinner from './spinner'

// 登录数据
export default function LoginModal(props) {
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