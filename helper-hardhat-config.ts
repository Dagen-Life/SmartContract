export interface networkConfigItem {
  ethUsdPriceFeed?: string
  blockConfirmations?: number
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  mainnet: {
    blockConfirmations: 6,
  },
  kovan: {
    blockConfirmations: 6,
  },
  rinkeby: {
    blockConfirmations: 6,
  },
}

export const developmentChains = ["hardhat", "localhost"]
export const proposalsFile = "proposals.json"

// Governor Values
export const QUORUM_PERCENTAGE = 4 // Need 4% of voters to pass
export const MIN_DELAY = 60 * 60 // 1 hour - after a vote passes, you have 1 hour before you can enact
export const ONE_HOUR = 60 * 60 // 1 hour - after a vote passes, you have 1 hour before you can enact
export const ONE_DAY = 24 * ONE_HOUR // 1 hour - after a vote passes, you have 1 hour before you can enact
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 5 // blocks
export const VOTING_DELAY = 1 // 1 Block - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

export const SPECIES = 77
export const FUNC = "changeGenSpecies"
export const FUNCV2 = "changeSssGen"
export const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the LifeDesign!"
