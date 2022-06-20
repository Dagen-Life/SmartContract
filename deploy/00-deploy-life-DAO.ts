import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, MIN_DELAY } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployLifeDAO: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying LifeDAO and waiting for confirmations...")
  const lifeDAO = await deploy("LifeDAO", {
    from: deployer,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`LifeDAO at ${lifeDAO.address}`)
  if (!developmentChains.includes(network.name)) {
    await verify(lifeDAO.address, [])
  }
}

export default deployLifeDAO
deployLifeDAO.tags = ["all", "token"]
