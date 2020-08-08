
import ethers, { BigNumber } from 'ethers'

export const formatUnits = (data,unit?) => {
  return Number(Number(ethers.utils.formatUnits(data, unit || 'ether')).toFixed(5)) || 0
}
export const formatEther = (data) => {
  return Number(Number(ethers.utils.formatEther(data)).toFixed(5)) || 0
}

export const getTime = () => {
  
}