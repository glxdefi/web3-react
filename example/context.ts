import React, { createContext } from 'react'

export const MyContext = React.createContext({  
  loginModalVisible: false, 
  setLoginModalVisible: undefined,
  pendings: [],
  setPendings: undefined
});
export const Provider = MyContext.Provider
