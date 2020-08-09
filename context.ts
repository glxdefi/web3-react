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
  setWinnerModalVisible: undefined,
  contracts:[Object],
  setContracts: undefined,
  game: [Object],
  setGame: undefined,
  tokenDetails:Object,
  setTokenDetails: undefined
});
export const Provider = MyContext.Provider
