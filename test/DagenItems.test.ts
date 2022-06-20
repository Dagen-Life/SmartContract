import { Contract } from "@ethersproject/contracts"
import { deepEqual, equal } from "assert"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers } from "hardhat"
import { DagenItems } from "../typechain-types"
import { TOKEN1_TOTAL, TOKEN1_TOTAL_BLIND_BOX } from "../utils"

describe("DagenItems", function () {
  const address0 = "0x0000000000000000000000000000000000000000"
  const bytes32empty = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const gasLimit = 10000000
  let dagenItems: DagenItems, openBlindBoxPrice: any

  const fee = 200
  const HUNDRED_PERCENT = 10_000
  const Params = {
    token_id: 1,
    price: ethers.utils.parseUnits("1", "ether"),
    escrow: ethers.utils
      .parseUnits("1", "ether")
      .mul(HUNDRED_PERCENT - fee)
      .div(HUNDRED_PERCENT),
    qty_1155: 10,
  }

  beforeEach(async () => {
    await deployments.fixture(["all"])
    dagenItems = await ethers.getContract("DagenItems")
  })

  it("basic info", async () => {
    const uri = await dagenItems.uri(0)
    assert.equal(uri, "https://dagen.io/gens/{id}.json")
  })


  it("Prevent transfer same gen to address", async function () {
    const [_, notAdmin, notAdmin1] = await ethers.getSigners()
    await dagenItems.mintBatch(notAdmin.address, [1, 2, 3, 4, 5], [1, 1, 1, 1, 1], bytes32empty, {
      gasLimit,
    })
    await dagenItems.mintBatch(notAdmin1.address, [1, 2, 3, 4, 5], [1, 1, 1, 1, 1], bytes32empty, {
      gasLimit,
    })

    await expect(
      dagenItems
        .connect(notAdmin1)
        .safeTransferFrom(notAdmin1.address, notAdmin.address, 1, 1, bytes32empty, { gasLimit })
    ).to.be.revertedWith("already have")

    let balance = await dagenItems.balanceOf(notAdmin1.address, 1)
    expect(balance.eq(1)).to.be.true

    balance = await dagenItems.balanceOf(notAdmin1.address, 1)
    expect(balance.eq(1)).to.be.true
  })

  it("Should Mint 0", async function () {
    const [_, notAdmin, notAdmin1, notAdmin2] = await ethers.getSigners()
    let balance

    await dagenItems.mint(notAdmin.address, 0, 1, bytes32empty, { gasLimit })

    balance = await dagenItems.balanceOf(notAdmin.address, 0)
    expect(balance.eq(1)).to.be.true
  })

  it("Should mint", async function () {
    const [_, notAdmin, notAdmin1, notAdmin2] = await ethers.getSigners()
    let balance

    await expect(
      dagenItems.connect(notAdmin).mint(notAdmin.address, 1, 2, bytes32empty, { gasLimit })
    ).to.be.reverted
    await dagenItems.mint(notAdmin.address, 1, 2, bytes32empty, { gasLimit })

    balance = await dagenItems.balanceOf(notAdmin.address, 1)
    expect(balance.eq(2)).to.be.true

    const totalSupply = await dagenItems.totalSupply(1)
    expect(totalSupply.eq(2)).to.be.true
  })


  it("Should mint not exceed preset", async function () {
    const [_, notAdmin, notAdmin1, notAdmin2] = await ethers.getSigners()

    await expect(dagenItems.mint(notAdmin.address, 1, TOKEN1_TOTAL + 1, bytes32empty, { gasLimit })).to.be.revertedWith("exceed preset")
  })

  it("Should mint batch", async function () {
    const [_, notAdmin, notAdmin1, notAdmin2] = await ethers.getSigners()
    let balance

    await expect(
      dagenItems
        .connect(notAdmin)
        .mintBatch(notAdmin.address, [1, 2], [2, 2], bytes32empty, { gasLimit })
    ).to.be.reverted
    await dagenItems.mintBatch(notAdmin.address, [1, 2], [2, 2], bytes32empty, { gasLimit })

    balance = await dagenItems.balanceOf(notAdmin.address, 1)
    expect(balance.eq(2)).to.be.true

    const totalSupply = await dagenItems.totalSupply(1)
    expect(totalSupply.eq(2)).to.be.true
  })


  it("Should mint batch not exceed preset", async function () {
    const [_, notAdmin, notAdmin1, notAdmin2] = await ethers.getSigners()

    await expect(dagenItems.mintBatch(notAdmin.address, [1, 2], [2, TOKEN1_TOTAL + 1], bytes32empty, { gasLimit })).to.be.revertedWith("exceed preset")
  })

  it("Should burn", async function () {
    const [_, notAdmin] = await ethers.getSigners()
    let balance

    await dagenItems.mint(notAdmin.address, 1, 2, bytes32empty, { gasLimit })
    balance = await dagenItems.balanceOf(notAdmin.address, 1)
    expect(balance.eq(2)).to.be.true

    await dagenItems.connect(notAdmin).burn(notAdmin.address, 1, 2, { gasLimit })

    balance = await dagenItems.balanceOf(notAdmin.address, 1)
    expect(balance.eq(0)).to.be.true

    const totalSupply = await dagenItems.totalSupply(1)
    expect(totalSupply.eq(0)).to.be.true
  })

  it("Should burn batch", async function () {
    const [_, notAdmin] = await ethers.getSigners()
    let balance

    await dagenItems.mintBatch(notAdmin.address, [1, 2], [2, 2], bytes32empty, { gasLimit })
    await dagenItems.connect(notAdmin).burnBatch(notAdmin.address, [1, 2], [2, 1], { gasLimit })

    balance = await dagenItems.balanceOf(notAdmin.address, 1)
    expect(balance.eq(0)).to.be.true

    balance = await dagenItems.balanceOf(notAdmin.address, 2)
    expect(balance.eq(1)).to.be.true

    const totalSupply = await dagenItems.totalSupply(2)
    expect(totalSupply.eq(1)).to.be.true
  })
})
