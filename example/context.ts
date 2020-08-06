import React, { createContext } from 'react'

export const MyContext = React.createContext({test: 123});
export const Provider = MyContext.Provider
