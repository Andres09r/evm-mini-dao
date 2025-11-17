import { viem } from "hardhat";
import { formatEther } from "viem";

async function main() {
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contracts with the account:", deployer.account.address);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("Account balance:", formatEther(balance), "ETH");

  // Deploy MiniDAO contract
  console.log("\nDeploying MiniDAO...");
  const miniDAO = await viem.deployContract("MiniDAO");

  console.log("MiniDAO deployed to:", miniDAO.address);
  console.log("Transaction hash:", miniDAO.deploymentTransaction?.hash);

  // Verify deployment by checking contract code
  const code = await publicClient.getBytecode({
    address: miniDAO.address,
  });
  
  if (code && code !== "0x") {
    console.log("✅ Contract deployed successfully!");
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    // Check initial values
    const proposalCount = await miniDAO.read.proposalCount();
    const votingPeriod = await miniDAO.read.VOTING_PERIOD();
    const minBalance = await miniDAO.read.MIN_BALANCE();
    
    console.log("Initial proposal count:", proposalCount.toString());
    console.log("Voting period:", votingPeriod.toString(), "blocks");
    console.log("Minimum balance required:", formatEther(minBalance), "ETH");
    
    // Create a test proposal
    console.log("\n📝 Creating a test proposal...");
    const createTx = await miniDAO.write.createProposal([
      "Test Proposal",
      "This is a test proposal to verify deployment"
    ]);
    
    console.log("Proposal creation transaction:", createTx);
    
    // Check updated proposal count
    const newProposalCount = await miniDAO.read.proposalCount();
    console.log("New proposal count:", newProposalCount.toString());
    
    // Get the proposal details
    const proposal = await miniDAO.read.getProposal([1n]);
    console.log("Proposal details:");
    console.log("- ID:", proposal[0].toString());
    console.log("- Title:", proposal[1]);
    console.log("- Description:", proposal[2]);
    console.log("- Created at block:", proposal[3].toString());
    console.log("- Yes votes:", proposal[4].toString());
    console.log("- No votes:", proposal[5].toString());
    console.log("- Finalized:", proposal[6]);
    console.log("- Passed:", proposal[7]);
    console.log("- Proposer:", proposal[8]);
    
  } else {
    console.log("❌ Contract deployment failed!");
  }

  // Save deployment info
  const deploymentInfo = {
    network: Number(await publicClient.getChainId()),
    contractAddress: miniDAO.address,
    deployerAddress: deployer.account.address,
    deploymentHash: miniDAO.deploymentTransaction?.hash,
    timestamp: new Date().toISOString(),
    blockNumber: Number(await publicClient.getBlockNumber()),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((deploymentInfo) => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

