import { Contract } from "@ethersproject/contracts"
import { deployments, ethers, getNamedAccounts, upgrades, network } from "hardhat"
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const LIFE_DESIGN = {
  V1: "",
  V2: "",
}

export const deployLifeDesignUpgradeableProxyAndTransferToTimelock = async (timeLock: Contract) => {
  const lifeDAO = await ethers.getContract("LifeDAO")
  const LifeDesign = await ethers.getContractFactory("LifeDesign")

  console.log("Deploying LifeDesign...")

  const upgrader = await upgrades.deployProxy(LifeDesign, [10, lifeDAO.address], {
    initializer: "initialize",
  })
  const lifeDesign = await upgrader.deployed()

  const lifeDesignContract = await ethers.getContractAt("LifeDesign", lifeDesign.address)
  const transferTx = await lifeDesignContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
  LIFE_DESIGN.V1 = lifeDesign.address
  return lifeDesign
}

export const getLifeDesignProxy = async () => {
  const lifeDesign = await ethers.getContractAt("LifeDesign", LIFE_DESIGN.V1)
  return lifeDesign
}

export const getLifeDesignV2Proxy = async () => {
  const lifeDesign = await ethers.getContractAt("LifeDesignV2", LIFE_DESIGN.V2)
  return lifeDesign
}

export const FEE = 250

export function sign(address: string, data: string) {
  return network.provider.send("personal_sign", [
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)),
    address,
  ])
}

export const TOKEN1_TOTAL = 10_000
export const TOKEN1_TOTAL_BLIND_BOX = 8_000

