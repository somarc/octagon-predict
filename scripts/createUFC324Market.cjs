const hre = require("hardhat");

// Contract addresses from deployment (update after deploy)
const MARKET_FACTORY_ADDRESS = process.env.MARKET_FACTORY_ADDRESS || "";

async function main() {
  if (!MARKET_FACTORY_ADDRESS) {
    throw new Error("Set MARKET_FACTORY_ADDRESS environment variable");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Creating UFC 324 markets with account:", deployer.address);

  const MarketFactory = await hre.ethers.getContractFactory("MarketFactory");
  const marketFactory = MarketFactory.attach(MARKET_FACTORY_ADDRESS);

  // UFC 324: Gaethje vs Pimblett
  // January 24, 2026 (approximate timestamp)
  const eventDate = Math.floor(new Date("2026-01-24T22:00:00Z").getTime() / 1000);
  const eventName = "UFC 324";
  const fighterA = "Justin Gaethje";
  const fighterB = "Paddy Pimblett";
  const collateralToken = hre.ethers.ZeroAddress; // Native VET
  const eventUri = "https://www.ufc.com/event/ufc-324";

  console.log("\nCreating UFC 324 Winner Market...");
  console.log(`  ${fighterA} vs ${fighterB}`);
  console.log(`  Event Date: ${new Date(eventDate * 1000).toISOString()}`);

  // 1. Create Winner Market (binary: Fighter A vs Fighter B)
  const winnerTx = await marketFactory.createWinnerMarket(
    eventName,
    fighterA,
    fighterB,
    eventDate,
    collateralToken,
    eventUri
  );
  const winnerReceipt = await winnerTx.wait();
  
  // Get condition ID from logs
  const winnerConditionId = winnerReceipt.logs[0]?.args?.[0] || "Check explorer";
  console.log("  Winner Market Created!");
  console.log("  Condition ID:", winnerConditionId);

  // 2. Create Method of Victory Market
  console.log("\nCreating UFC 324 Method of Victory Market...");
  const methodTx = await marketFactory.createMethodMarket(
    eventName,
    fighterA,
    fighterB,
    eventDate,
    collateralToken,
    eventUri
  );
  const methodReceipt = await methodTx.wait();
  
  const methodConditionId = methodReceipt.logs[0]?.args?.[0] || "Check explorer";
  console.log("  Method Market Created!");
  console.log("  Condition ID:", methodConditionId);
  console.log("  Outcomes: A by KO/TKO, A by Sub, A by Dec, B by KO/TKO, B by Sub, B by Dec");

  // 3. Create Goes the Distance Market
  console.log("\nCreating UFC 324 Goes the Distance Market...");
  const distanceTx = await marketFactory.createGoesDistanceMarket(
    eventName,
    fighterA,
    fighterB,
    eventDate,
    collateralToken,
    eventUri
  );
  const distanceReceipt = await distanceTx.wait();
  
  const distanceConditionId = distanceReceipt.logs[0]?.args?.[0] || "Check explorer";
  console.log("  Goes the Distance Market Created!");
  console.log("  Condition ID:", distanceConditionId);
  console.log("  Outcomes: Yes (Decision), No (Finish)");

  console.log("\n========================================");
  console.log("UFC 324 MARKETS CREATED");
  console.log("========================================");
  console.log("\nMarket Condition IDs:");
  console.log("Winner:           ", winnerConditionId);
  console.log("Method of Victory:", methodConditionId);
  console.log("Goes the Distance:", distanceConditionId);

  console.log("\nReady for trading!");
  console.log("1. Users can now split VET into outcome tokens");
  console.log("2. Trade shares via Exchange contract");
  console.log("3. After fight: AdminOracle resolves market");
  console.log("4. Winners redeem tokens for payout");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
