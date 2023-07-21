// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Claim Bounty", function () {

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
    await bountyDapp.connect(creator).acceptBounty(1, addr1.address);

  });

  
  it("Should claim a bounty successfully", async function () {

    // Claim the bounty by addr1 (winner)
    await expect(bountyDapp.connect(addr1).claimBounty(1))
      .to.changeEtherBalance(addr1, bountyAmount);

    // Check that the bounty is marked as claimed
    const bounty = await bountyDapp.idToBounty(1);
    expect(bounty.isClaimed).to.equal(true);

    // Check that the contract balance is zero after the claim
    const contractBalance = await ethers.provider.getBalance(bountyDapp);
    expect(contractBalance).to.equal(0);
  });

  it("Should revert claiming a non-existent bounty", async function () {
    // Claim a non-existent bounty (should revert)
    await expect(bountyDapp.connect(addr1).claimBounty(2))
      .to.be.revertedWith("Invalid bounty ID");
  });


  it("Should revert claiming a bounty that has already been claimed", async function () {

    // Claim the bounty by addr1 (winner)
    await bountyDapp.connect(addr1).claimBounty(1);

    // Try to claim the same bounty again (should revert)
    await expect(bountyDapp.connect(addr1).claimBounty(1))
      .to.be.revertedWith("Bounty has already been claimed");
  });

  it("Should revert claiming a bounty by someone who did not submit a solution", async function () {

    await expect(bountyDapp.connect(addr2).claimBounty(1))
      .to.be.revertedWith("You have not submitted a solution");
  });

  it("Should revert claiming a bounty by someone who is not the winner", async function () {

    await bountyDapp.connect(addr2).submitSolution(1);

    // Claim the bounty by addr2 (not the winner, should revert)
    await expect(bountyDapp.connect(addr2).claimBounty(1))
      .to.be.revertedWith("You are not the winner of this bounty");
  });

});
