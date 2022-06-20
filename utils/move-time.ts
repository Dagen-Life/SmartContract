import { network } from "hardhat"
import { sleep } from "."

export async function moveTime(amount: number) {
  console.log("Moving blocks...")
  await network.provider.send("evm_increaseTime", [amount])
  await sleep(2000)
  console.log(`Moved forward in time ${amount} seconds`)
}
