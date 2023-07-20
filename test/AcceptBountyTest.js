// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Accept Bounty", function () {

  let bountyDapp;
  let dappOwner;
  let creator;
  let addr1;
  let addr2;
  let bountyAmount;

  beforeEach(async function () {
    [dappOwner, creator, addr1, addr2] = await ethers.getSigners();

    bountyDapp = await ethers.deployContract("BountyDapp");
    await bountyDapp.waitForDeployment();
    
    bountyAmount = ethers.parseEther("1.0");
    await bountyDapp.connect(creator).createBounty({ value: bountyAmount });
    await bountyDapp.connect(addr1).submitSolution(1);


  });

  it("Should accept a bounty submission with a valid winner address", async function () {

    await expect(bountyDapp.connect(creator).acceptBounty(1, addr1.address))
      .to.emit(bountyDapp, "BountyAccepted")
      .withArgs(1, addr1.address);

    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.winner).to.equal(addr1.address);
  });

  it("Should revert when accepting a non-existent bounty", async function () {
    // Attempt to accept a non-existent bounty
    await expect(bountyDapp.connect(creator).acceptBounty(2, addr1.address))
      .to.be.revertedWith("Invalid bounty ID");

    const bounty = await bountyDapp.idToBounty(2);
    expect(bounty.winner).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should revert when accepting a bounty by someone who is not the creator", async function () {

    await expect(bountyDapp.connect(addr1).acceptBounty(1, addr1.address))
      .to.be.revertedWith("Only bounty creator can accept a submission");

    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.winner).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should revert when accepting a bounty that has already been accepted", async function () {

    await expect(bountyDapp.connect(creator).acceptBounty(1, addr1.address))
      .to.emit(bountyDapp, "BountyAccepted")
      .withArgs(1, addr1.address);

    await expect(bountyDapp.connect(creator).acceptBounty(1, addr1.address))
      .to.be.revertedWith("Bounty already accepted");

    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.winner).to.equal(addr1.address);
  });

  it("Should revert when accepting a bounty with an invalid winner address", async function () {

    // Attempt to accept the bounty with an address that hasn't submitted a solution
    await expect(bountyDapp.connect(creator).acceptBounty(1, addr2.address))
      .to.be.revertedWith("The specified winner has not submitted a solution yet");

    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.winner).to.equal("0x0000000000000000000000000000000000000000");
  });


});
