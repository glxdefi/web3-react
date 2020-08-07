import React, { createContext } from 'react'

export const MyContext = React.createContext({  
  loginModalVisible: false, 
  setLoginModalVisible: undefined,
  pendings: [],
  setPendings: undefined,
  teams: [Object],
  setTeams: undefined
});
export const Provider = MyContext.Provider
