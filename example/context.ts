import React, { createContext } from 'react'

export const MyContext = React.createContext({ showLoginModal: false});
export const Provider = MyContext.Provider
