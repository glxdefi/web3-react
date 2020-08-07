import React, { createContext } from 'react'

export const MyContext = React.createContext({  
  loginModalVisible: false, 
  setLoginModalVisible: undefined,
  pendings: [],
  setPendings: undefined,
  teams: [Object],
  setTeams: undefined,
  event: Object,
  setEvent: undefined,
  winnerModalVisible: false, 
  setWinnerModalVisible: undefined
});
export const Provider = MyContext.Provider
