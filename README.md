# MiniDAO - Lightweight Governance Module

### Running the Application
1. **Install node modules**
   ```
   npm run install-all
   ```

2. **Start Hardhat local network**
   ```
   npm run node
   ```
   Keep this terminal open. The network will run on `http://127.0.0.1:8545`

3. **Deploy the contract (in a new terminal)**
   ```
   npm run deploy-local
   ```

4. **Start the frontend (in a new terminal)**
   ```
   npm run frontend
   ```
   The frontend will be available at `http://localhost:5173`

5. **Connect your wallet**
   - Open the application in your browser
   - Click "Connect Wallet" and select your preferred wallet
   - Make sure your wallet is connected to the Hardhat network (Chain ID: 31337)
   - Import one of the Hardhat test accounts for testing

## 🧪 Testing

### Smart Contract Tests
```
# Run all tests
npx hardhat test

# Run tests with gas reporting
npx hardhat test --reporter gas

# Run specific test file
npx hardhat test test/MiniDAO.test.ts
```

### Test Coverage
- ✅ Contract deployment and initialization
- ✅ Proposal creation with validation
- ✅ Voting system with ETH balance requirements
- ✅ Double voting prevention
- ✅ Proposal finalization after voting period
- ✅ Event emission verification
- ✅ Edge case handling

## 📋 Smart Contract API

### Core Functions

#### `createProposal(string title, string description) → uint256`
Creates a new proposal and returns the proposal ID.
- **Requirements**: Title and description cannot be empty
- **Events**: Emits `ProposalCreated`

#### `vote(uint256 proposalId, bool vote)`
Submit a vote on a proposal.
- **Requirements**: 
  - Voter must have ≥ 0.1 ETH balance
  - Cannot vote twice on same proposal
  - Proposal must not be finalized
- **Events**: Emits `VoteSubmitted`

#### `finalizeProposal(uint256 proposalId)`
Finalize a proposal after the voting period.
- **Requirements**: 20 blocks must have passed since creation
- **Events**: Emits `ProposalFinalized`

### View Functions

#### `getProposal(uint256 proposalId) → (id, title, description, createdAtBlock, yesVotes, noVotes, finalized, passed, proposer)`
Get complete proposal information.

#### `getVoteCounts(uint256 proposalId) → (yesVotes, noVotes, totalVotes)`
Get vote tallies for a proposal.

#### `canVote(address voter) → bool`
Check if an address is eligible to vote.

#### `hasUserVoted(uint256 proposalId, address voter) → bool`
Check if a user has already voted on a proposal.

#### `canFinalizeProposal(uint256 proposalId) → bool`
Check if a proposal can be finalized.

#### `getRemainingBlocks(uint256 proposalId) → uint256`
Get remaining blocks until proposal can be finalized.

## 🌐 Network Configuration

### Hardhat Localhost
- **Network**: Hardhat
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Contract Address**: `0x5fbdb2315678afecb367f032d93f642f64180aa3`

### Sepolia Testnet (Configuration Ready)
To deploy on Sepolia:
1. Create a `.env` file with:
   ```
   SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here  //optional
   ```
2. Run: `npm run deploy-sepolia`

   Replace `MINIDAO_CONTRACT_ADDRESS` in `frontend/src/lib/wagmi.ts` to deployed address on Sepolia chain.\
   Default deployed address: `0xD6e8367Cf97f294FD0A4eFDE2d933D43939133B3`

