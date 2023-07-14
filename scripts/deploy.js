async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    const BountyDapp = await ethers.deployContract("BountyDapp");

    await BountyDapp.waitForDeployment();
  
    console.log("Bounty Dapp address:", await BountyDapp.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });