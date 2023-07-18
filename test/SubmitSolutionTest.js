// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Submit Solution", function () {

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


  });

  it("Should submit a solution successfully", async function () {

    // Check initial submission status
    const initialSubmissionStatus = await bountyDapp.submissions(1, addr1.address);
    expect(initialSubmissionStatus).to.equal(false);

    // Submit a solution
    await  bountyDapp.connect(addr1).submitSolution(1);

    // Check updated submission status
    const updatedSubmissionStatus = await bountyDapp.submissions(1, addr1.address);
    expect(updatedSubmissionStatus).to.equal(true);
  });

  it("Should revert if submitting a solution to a non-existent bounty", async function () {
    await expect(bountyDapp.submitSolution(2))
      .to.be.revertedWith("Invalid bounty ID");
  });

  it("Should revert if submitting multiple solutions for the same bounty", async function () {

    await bountyDapp.submitSolution(1);

    await expect(bountyDapp.submitSolution(1))
      .to.be.revertedWith("You have already submitted a solution");
  });
  

});
