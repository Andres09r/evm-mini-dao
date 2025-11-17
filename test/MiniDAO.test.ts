import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseEther } from "viem";

describe("MiniDAO", function () {
  async function deployMiniDAOFixture() {
    const [owner, voter1, voter2, voter3] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    const miniDAO = await viem.deployContract("MiniDAO");

    // Fund voters with ETH to meet voting requirements
    await owner.sendTransaction({
      to: voter1.account.address,
      value: parseEther("1.0"),
    });
    await owner.sendTransaction({
      to: voter2.account.address,
      value: parseEther("0.5"),
    });

    return {
      miniDAO,
      owner,
      voter1,
      voter2,
      voter3,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      expect(await miniDAO.read.proposalCount()).to.equal(0n);
      expect(await miniDAO.read.VOTING_PERIOD()).to.equal(20n);
      expect(await miniDAO.read.MIN_BALANCE()).to.equal(parseEther("0.1"));
    });
  });

  describe("Proposal Creation", function () {
    it("Should create a proposal successfully", async function () {
      const { miniDAO, owner } = await deployMiniDAOFixture();

      const title = "Test Proposal";
      const description = "This is a test proposal";

      await miniDAO.write.createProposal([title, description]);

      expect(await miniDAO.read.proposalCount()).to.equal(1n);

      const proposal = await miniDAO.read.getProposal([1n]);
      expect(proposal[0]).to.equal(1n); // id
      expect(proposal[1]).to.equal(title); // title
      expect(proposal[2]).to.equal(description); // description
      expect(proposal[4]).to.equal(0n); // yesVotes
      expect(proposal[5]).to.equal(0n); // noVotes
      expect(proposal[6]).to.equal(false); // finalized
      expect(proposal[7]).to.equal(false); // passed
      expect(getAddress(proposal[8])).to.equal(getAddress(owner.account.address)); // proposer
    });

    it("Should reject empty title", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await expect(
        miniDAO.write.createProposal(["", "Description"])
      ).to.be.rejectedWith("Title cannot be empty");
    });

    it("Should reject empty description", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await expect(
        miniDAO.write.createProposal(["Title", ""])
      ).to.be.rejectedWith("Description cannot be empty");
    });
  });

  describe("Voting", function () {
    it("Should allow eligible voter to vote", async function () {
      const { miniDAO, voter1 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      await miniDAO.write.vote([1n, true], { account: voter1.account });

      const voteCounts = await miniDAO.read.getVoteCounts([1n]);
      expect(voteCounts[0]).to.equal(1n); // yesVotes
      expect(voteCounts[1]).to.equal(0n); // noVotes
      expect(voteCounts[2]).to.equal(1n); // totalVotes
    });

    it("Should reject vote from ineligible voter", async function () {
      const { miniDAO, voter3 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      await expect(
        miniDAO.write.vote([1n, true], { account: voter3.account })
      ).to.be.rejectedWith("Insufficient ETH balance to vote");
    });

    it("Should reject double voting", async function () {
      const { miniDAO, voter1 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);
      await miniDAO.write.vote([1n, true], { account: voter1.account });

      await expect(
        miniDAO.write.vote([1n, false], { account: voter1.account })
      ).to.be.rejectedWith("Already voted on this proposal");
    });

    it("Should reject vote on non-existent proposal", async function () {
      const { miniDAO, voter1 } = await deployMiniDAOFixture();

      await expect(
        miniDAO.write.vote([999n, true], { account: voter1.account })
      ).to.be.rejectedWith("Proposal does not exist");
    });
  });

  describe("Proposal Finalization", function () {
    it("Should finalize proposal after voting period", async function () {
      const { miniDAO, voter1 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);
      await miniDAO.write.vote([1n, true], { account: voter1.account });

      // Mine 20 blocks to pass voting period
      const testClient = await viem.getTestClient();
      await testClient.mine({ blocks: 20 });

      await miniDAO.write.finalizeProposal([1n]);

      const proposal = await miniDAO.read.getProposal([1n]);
      expect(proposal[6]).to.equal(true); // finalized
      expect(proposal[7]).to.equal(true); // passed
    });

    it("Should reject early finalization", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      await expect(
        miniDAO.write.finalizeProposal([1n])
      ).to.be.rejectedWith("Voting period not yet ended");
    });

    it("Should reject double finalization", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      // Mine 20 blocks
      const testClient = await viem.getTestClient();
      await testClient.mine({ blocks: 20 });

      await miniDAO.write.finalizeProposal([1n]);

      await expect(
        miniDAO.write.finalizeProposal([1n])
      ).to.be.rejectedWith("Proposal already finalized");
    });
  });

  describe("View Functions", function () {
    it("Should check if user has voted", async function () {
      const { miniDAO, voter1, voter2 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);
      await miniDAO.write.vote([1n, true], { account: voter1.account });

      expect(await miniDAO.read.hasUserVoted([1n, voter1.account.address])).to.equal(true);
      expect(await miniDAO.read.hasUserVoted([1n, voter2.account.address])).to.equal(false);
    });

    it("Should get user vote", async function () {
      const { miniDAO, voter1 } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);
      await miniDAO.write.vote([1n, true], { account: voter1.account });

      expect(await miniDAO.read.getUserVote([1n, voter1.account.address])).to.equal(true);
    });

    it("Should check if proposal can be finalized", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      expect(await miniDAO.read.canFinalizeProposal([1n])).to.equal(false);

      // Mine 20 blocks
      const testClient = await viem.getTestClient();
      await testClient.mine({ blocks: 20 });

      expect(await miniDAO.read.canFinalizeProposal([1n])).to.equal(true);
    });

    it("Should get remaining blocks", async function () {
      const { miniDAO } = await deployMiniDAOFixture();

      await miniDAO.write.createProposal(["Test", "Description"]);

      const remaining = await miniDAO.read.getRemainingBlocks([1n]);
      expect(Number(remaining)).to.be.greaterThan(0);

      // Mine 20 blocks
      const testClient = await viem.getTestClient();
      await testClient.mine({ blocks: 20 });

      expect(await miniDAO.read.getRemainingBlocks([1n])).to.equal(0n);
    });
  });
});

