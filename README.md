# 🧾 Optimism Account Setup Script

This script automates the creation and funding of **15 new Ethereum wallets** on **Optimism mainnet**, including:

- Sending each account:
  - `0.0004 ETH` for gas
  - `5 USDC`
- Granting **infinite approvals** for both `USDC` and `aUSDC` to a Settler contract
- Generating **QR codes** for easy MetaMask mobile import

---

## 📦 Requirements

- Node.js v16 or higher
- An Optimism wallet funded with:
  - At least `0.006 ETH` (0.0004 × 15)
  - At least `75 USDC` (5 × 15)

---

## ⚙️ Setup

1. **Clone this repo**

```bash
git clone https://github.com/your-repo/optimism-setup.git
cd optimism-setup
```

2. **Install dependencies**

```bash
npm init -y
npm install ethers qrcode dotenv
npm install --save-dev typescript ts-node @types/node @types/qrcode
npx tsc --init
mkdir qr
```

3. **Create `.env` file**

```
RPC_URL=https://mainnet.optimism.io
PRIVATE_KEY=your_funding_wallet_private_key
```

4. **Check `setup-accounts.ts` addresses**

```
const USDC_ADDRESS = "...";
const AUSDC_ADDRESS = "...";
const SETTLER_ADDRESS = "...";
```

5. **Run the script**

```bash
npx ts-node setup-accounts.ts
```

This will:
- Generate 15 new random wallets
- Fund each with ETH and USDC
- Approve USDC and aUSDC to the SETTLER_ADDRESS
- Save:
    - accounts.txt with all private keys and addresses
    - QR codes in qr/account-*.png (import into MetaMask mobile)