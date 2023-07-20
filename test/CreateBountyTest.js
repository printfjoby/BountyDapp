// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Create Bounty", function () {

  let bountyDapp;
  let dappOwner;
  let creator;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [dappOwner, creator, addr1, addr2] = await ethers.getSigners();

    bountyDapp = await ethers.deployContract("BountyDapp");
    await bountyDapp.waitForDeployment();

  });

  it("Should create a bounty with the correct values", async function () {
    const bountyAmount = ethers.parseEther("1.0");

    // Create a new bounty with the specified value
    await bountyDapp.connect(creator).createBounty({ value: bountyAmount });

    // Check the bounty details
    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.creator).to.equal(creator.address);
    expect(bounty.amount).to.equal(bountyAmount);
    expect(bounty.isClaimed).to.equal(false);
    expect(bounty.winner).to.equal("0x0000000000000000000000000000000000000000");

    // Check the emitted event
    const createBountyEvent = await bountyDapp.queryFilter("BountyCreated");
    expect(createBountyEvent.length).to.equal(1);
    expect(parseInt(createBountyEvent[0].args.id)).to.equal(1);
    expect(createBountyEvent[0].args.creator).to.equal(creator.address);
    expect(createBountyEvent[0].args.amount).to.equal(bountyAmount);
  });

  it("Should not create a bounty with 0 value", async function () {
    // Attempt to create a bounty with a value of 0
    await expect(bountyDapp.createBounty({ value: 0 })).to.be.revertedWith(
      "Bounty amount must be greater than 0"
    );
  });

});
