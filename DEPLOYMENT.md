# Deployment Guide

This guide covers deploying the MiniDAO smart contract to different networks and setting up the frontend for production.

## Smart Contract Deployment

### Local Development (Hardhat Network)

1. **Start Hardhat Node**
   ```bash
   npx hardhat node
   ```
   This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.

2. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. **Verify Deployment**
   The script will output:
   - Contract address
   - Deployer address
   - Transaction hash
   - Test proposal creation

### Sepolia Testnet Deployment

1. **Setup Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

2. **Get Sepolia ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your deployer address

3. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

4. **Verify Contract (Optional)**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
   ```

### Mainnet Deployment (Production)

⚠️ **Warning**: Mainnet deployment costs real ETH. Ensure thorough testing first.

1. **Setup Mainnet Configuration**
   Add to `hardhat.config.ts`:
   ```typescript
   mainnet: {
     url: process.env.MAINNET_URL || "",
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
     chainId: 1,
   }
   ```

2. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy.ts --network mainnet
   ```

## Frontend Deployment

### Development Server
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173`

### Production Build

1. **Update Contract Address**
   Edit `frontend/src/lib/wagmi.ts` with your deployed contract address:
   ```typescript
   export const MINIDAO_CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
   ```

2. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Deploy automatically on push

#### Netlify
1. Connect repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Deploy

#### Traditional Web Server
1. Build the project: `npm run build`
2. Upload `frontend/dist/` contents to your web server
3. Configure server to serve `index.html` for all routes

## Network Configuration

### Adding Networks to Wagmi Config

Edit `frontend/src/lib/wagmi.ts`:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MiniDAO DApp',
  projectId: 'your-walletconnect-project-id',
  chains: [hardhat, sepolia, mainnet], // Add your networks
  ssr: false,
});
```

### Contract Addresses by Network

Update the contract address based on deployment:

```typescript
const CONTRACT_ADDRESSES = {
  31337: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // Hardhat
  11155111: '0xYourSepoliaAddress', // Sepolia
  1: '0xYourMainnetAddress', // Mainnet
};

export const MINIDAO_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[chainId];
```

## Environment Variables

### Backend (.env)
```env
# Sepolia Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Mainnet Configuration (if needed)
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

### Frontend Environment Variables
Create `frontend/.env`:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

## Post-Deployment Checklist

### Smart Contract
- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan (if applicable)
- [ ] Test proposal creation works
- [ ] Test voting functionality
- [ ] Test proposal finalization
- [ ] Gas costs are reasonable

### Frontend
- [ ] Wallet connection works
- [ ] Contract interactions function correctly
- [ ] Error handling displays properly
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] SEO meta tags added (if needed)

## Troubleshooting

### Common Deployment Issues

1. **"Insufficient funds" Error**
   - Ensure deployer account has enough ETH for gas
   - Check current gas prices on the network

2. **"Nonce too high" Error**
   - Reset your wallet's transaction history
   - Or specify nonce manually in deployment script

3. **Frontend Can't Connect to Contract**
   - Verify contract address is correct
   - Check network configuration matches deployment
   - Ensure ABI is up to date

4. **Wallet Connection Issues**
   - Verify WalletConnect project ID
   - Check supported networks in config
   - Clear browser cache and wallet data

### Gas Optimization Tips

1. **Batch Operations**: Group multiple calls when possible
2. **Optimize Storage**: Use packed structs and appropriate data types
3. **Remove Unused Code**: Clean up before deployment
4. **Use Events**: Instead of storing data that's only read off-chain

## Monitoring and Maintenance

### Contract Monitoring
- Monitor contract events using tools like The Graph
- Set up alerts for unusual activity
- Track gas usage and optimization opportunities

### Frontend Monitoring
- Use tools like Sentry for error tracking
- Monitor Web3 connection success rates
- Track user engagement and transaction success

## Security Considerations

### Pre-Deployment Security Checks
- [ ] Run static analysis tools (Slither, MythX)
- [ ] Conduct thorough testing
- [ ] Review all external dependencies
- [ ] Verify no hardcoded secrets
- [ ] Test with different wallet types

### Post-Deployment Security
- [ ] Monitor for unusual transactions
- [ ] Keep dependencies updated
- [ ] Have incident response plan
- [ ] Consider bug bounty program for mainnet

## Backup and Recovery

### Smart Contract
- Keep deployment scripts and configuration
- Store ABI and contract addresses securely
- Document all deployment parameters

### Frontend
- Backup build configurations
- Document environment setup
- Keep deployment keys secure
- Regular backups of custom configurations

