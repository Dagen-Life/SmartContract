import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../helper-functions"
import { developmentChains, networkConfig } from "../helper-hardhat-config"

const deployMarketAndItems: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying Items...")

  const dagenItems = await deploy("DagenItems", {
    from: deployer,
    log: true,
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })

  if (!developmentChains.includes(network.name)) {
    await verify(dagenItems.address, [])
  }

  log(`DagenItems at ${dagenItems.address}`)
}

export default deployMarketAndItems
deployMarketAndItems.tags = ["all", "items"]
