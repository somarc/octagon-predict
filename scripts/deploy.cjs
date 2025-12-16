const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying Octagon Predict contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy ConditionalTokens first (core contract)
  console.log("\n1. Deploying ConditionalTokens...");
  const ConditionalTokens = await hre.ethers.getContractFactory("ConditionalTokens");
  const conditionalTokens = await ConditionalTokens.deploy(deployer.address);
  await conditionalTokens.waitForDeployment();
  const ctfAddress = await conditionalTokens.getAddress();
  console.log("   ConditionalTokens deployed to:", ctfAddress);

  // 2. Deploy MarketFactory
  console.log("\n2. Deploying MarketFactory...");
  const MarketFactory = await hre.ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(ctfAddress);
  await marketFactory.waitForDeployment();
  const factoryAddress = await marketFactory.getAddress();
  console.log("   MarketFactory deployed to:", factoryAddress);

  // 3. Deploy Exchange
  console.log("\n3. Deploying Exchange...");
  const Exchange = await hre.ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(ctfAddress, deployer.address);
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log("   Exchange deployed to:", exchangeAddress);

  // 4. Deploy AdminOracle
  console.log("\n4. Deploying AdminOracle...");
  const AdminOracle = await hre.ethers.getContractFactory("AdminOracle");
  const adminOracle = await AdminOracle.deploy(ctfAddress);
  await adminOracle.waitForDeployment();
  const oracleAddress = await adminOracle.getAddress();
  console.log("   AdminOracle deployed to:", oracleAddress);

  // 5. Configure ConditionalTokens to use AdminOracle
  console.log("\n5. Configuring ConditionalTokens oracle...");
  await conditionalTokens.setOracle(oracleAddress);
  console.log("   Oracle set to AdminOracle");

  // 6. Transfer ownership of ConditionalTokens to MarketFactory
  console.log("\n6. Transferring ConditionalTokens ownership to MarketFactory...");
  await conditionalTokens.transferOwnership(factoryAddress);
  console.log("   Ownership transferred to MarketFactory");

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE - Octagon Predict");
  console.log("========================================");
  console.log("\nContract Addresses (save these!):");
  console.log("ConditionalTokens:", ctfAddress);
  console.log("MarketFactory:    ", factoryAddress);
  console.log("Exchange:         ", exchangeAddress);
  console.log("AdminOracle:      ", oracleAddress);
  
  console.log("\nNext Steps:");
  console.log("1. Fund testnet wallet with VET/VTHO from faucet");
  console.log("2. Create UFC 324 test market using MarketFactory");
  console.log("3. Test split/merge/redeem flows");
  console.log("4. Set up off-chain order book with Exchange address");

  return {
    conditionalTokens: ctfAddress,
    marketFactory: factoryAddress,
    exchange: exchangeAddress,
    adminOracle: oracleAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
