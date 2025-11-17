import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MiniDAO DApp',
  projectId: 'ca35f70a0a3835f0a4b88414393657b9', // Replace with your WalletConnect project ID
  chains: [hardhat, sepolia],
  ssr: false,
});

export const MINIDAO_CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

export const MINIDAO_ABI = [
  {
    "inputs": [],
    "name": "MIN_BALANCE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VOTING_PERIOD",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_voter", "type": "address"}
    ],
    "name": "canVote",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"}
    ],
    "name": "canFinalizeProposal",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"}
    ],
    "name": "createProposal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"}
    ],
    "name": "finalizeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"}
    ],
    "name": "getProposal",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "createdAtBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "noVotes", "type": "uint256"},
      {"internalType": "bool", "name": "finalized", "type": "bool"},
      {"internalType": "bool", "name": "passed", "type": "bool"},
      {"internalType": "address", "name": "proposer", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"}
    ],
    "name": "getRemainingBlocks",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"}
    ],
    "name": "getVoteCounts",
    "outputs": [
      {"internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "noVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "totalVotes", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"},
      {"internalType": "address", "name": "_voter", "type": "address"}
    ],
    "name": "hasUserVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"},
      {"internalType": "bool", "name": "_vote", "type": "bool"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "proposer", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "description", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "createdAtBlock", "type": "uint256"}
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "passed", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "noVotes", "type": "uint256"}
    ],
    "name": "ProposalFinalized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "voter", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "vote", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "noVotes", "type": "uint256"}
    ],
    "name": "VoteSubmitted",
    "type": "event"
  }
] as const;

