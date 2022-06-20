import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers } from "hardhat"
import { MIN_DELAY, ONE_DAY } from "../helper-hardhat-config"
import { LifeDAO } from "../typechain-types"
import { moveTime } from "../utils/move-time"

describe("Token", async () => {
  let lifeDAO: LifeDAO
  beforeEach(async () => {
    await deployments.fixture(["all"])
    lifeDAO = await ethers.getContract("LifeDAO")
  })

  it("basic info", async () => {
    const name = await lifeDAO.name()
    assert.equal(name, "DAGEN lifeDAO")
    const symbol = await lifeDAO.symbol()
    assert.equal(symbol, "DAGEN")
    const initSupply = await lifeDAO.initSupply()
    assert.equal(initSupply.toNumber(), 10000000000)
    const decimals = await lifeDAO.decimals()
    assert.equal(decimals, 0)
  })

  it("admin get all init supply", async () => {
    const [admin] = await ethers.getSigners()
    const balance = await lifeDAO.balanceOf(admin.address)
    const initSupply = await lifeDAO.initSupply()
    assert.equal(balance.toString(), initSupply.toString())
  })

  it("token locked in contract when not reach release time, balance is 0", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    const balance = await lifeDAO.balanceOf(chris.address)
    assert.equal(balance.toString(), BigNumber.from(0).toString())
  })

  it("token locking in contract when not reach release time, locked balance is equal to transfer to locked", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    const locked = await lifeDAO.lockedBalanceOf(chris.address)
    assert.equal(locked.toString(), BigNumber.from(1_000_000).toString())
  })

  it("token locking in contract when not reach release time, call release will be revert with 'non-releaseable'", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await expect(lifeDAO.unlock(chris.address)).to.be.revertedWith("non-releasable")
  })

  it("token locking in contract when reach release time, can be release to benefit address", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)

    await moveTime(ONE_DAY + 120)

    await lifeDAO.unlock(chris.address)
    const balance1 = await lifeDAO.balanceOf(chris.address)
    assert.equal(balance1.toString(), BigNumber.from(1_000_000).toString())
  })

  it("token seperate locking in contract when not reach release time, balance is 0", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)

    const balance = await lifeDAO.balanceOf(chris.address)
    assert.equal(balance.toString(), BigNumber.from(0).toString())
  })

  it("token seperate locking in contract when not reach release time, locked balance is equal to transfer to locked", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)

    const locked = await lifeDAO.lockedBalanceOf(chris.address)
    assert.equal(locked.toString(), BigNumber.from(3_000_000).toString())
  })

  it("token seperate locking in contract when not reach release time, call release will be revert with 'non-releaseable'", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)

    await expect(lifeDAO.unlock(chris.address)).to.be.revertedWith("non-releasable")
  })

  it("case 1: token seperate locking in contract when not reach release time, can be release to benefit address", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)

    await moveTime(ONE_DAY + 120)

    {
      await lifeDAO.unlock(chris.address)
      const balance1 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance1.toString(), BigNumber.from(1_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(2_000_000).toString())
    }

    await moveTime(4 * ONE_DAY)

    {
      await lifeDAO.unlock(chris.address)
      const balance2 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance2.toString(), BigNumber.from(3_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(0).toString())
      await expect(lifeDAO.unlock(chris.address)).to.be.revertedWith("no locked")
    }
  })

  it("case2: token seperate locking in contract when not reach release time, can be release to benefit address", async () => {
    const [admin, chris] = await ethers.getSigners()

    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)

    await moveTime(ONE_DAY + 120)

    {
      await lifeDAO.unlock(chris.address)
      const balance1 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance1.toString(), BigNumber.from(1_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(2_000_000).toString())
    }

    await moveTime(4 * ONE_DAY)

    {
      await lifeDAO.unlock(chris.address)
      const balance2 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance2.toString(), BigNumber.from(3_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(0).toString())
      await expect(lifeDAO.unlock(chris.address)).to.be.revertedWith("no locked")
    }
  })

  it("case3: unlock token and get details", async () => {
    const [admin, chris] = await ethers.getSigners()
    const timestamp = Date.now()
    const fiveDays = 1000 * 60 * 60 * 24 * 5
    const errorRange = 300 // 300s

    await lifeDAO.connect(admin).transferAndLock(chris.address, 2_000_000, 5)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await lifeDAO.connect(admin).transferAndLock(chris.address, 3_000_000, 2)

    const details = await lifeDAO.lockedDetailsOf(chris.address)
    console.log(details)

    await moveTime(ONE_DAY * 2)

    {
      await lifeDAO.unlock(chris.address)
      const balance1 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance1.toString(), BigNumber.from(4_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(2_000_000).toString())

      const details = await lifeDAO.lockedDetailsOf(chris.address)

      expect(details.filter((d) => d.amount.gt(0)).length).equal(1)
      expect(details[0].amount).equal(BigNumber.from(2_000_000))
      expect(Math.abs((timestamp + fiveDays) / 1000 - Number(details[0].releaseTime)) < errorRange)
        .to.be.true
    }

    await lifeDAO.connect(admin).transferAndLock(chris.address, 1_000_000, 1)
    await moveTime(4 * ONE_DAY)

    {
      await lifeDAO.unlock(chris.address)
      const balance2 = await lifeDAO.balanceOf(chris.address)
      assert.equal(balance2.toString(), BigNumber.from(7_000_000).toString())
      const locked = await lifeDAO.lockedBalanceOf(chris.address)
      assert.equal(locked.toString(), BigNumber.from(0).toString())
      await expect(lifeDAO.unlock(chris.address)).to.be.revertedWith("no locked")

      const details = await lifeDAO.lockedDetailsOf(chris.address)
      expect(details.length).equal(0)
    }
  })
})
