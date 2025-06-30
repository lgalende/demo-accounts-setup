# 🧾 Optimism Account Setup Script

The `setup-accounts.ts` script automates the creation and funding of **15 new Ethereum wallets** on **Optimism mainnet**, including:

- Sending each account:
  - `0.0001 ETH` for gas
  - `5 USDC`
- Granting **infinite approvals** for both `USDC` and `aUSDC` to a Settler contract
- Generating **QR codes** for easy MetaMask mobile import

---

## 📦 Requirements

- Node.js v16 or higher
- An Optimism wallet funded with:
  - At least `0.0015 ETH` (0.0001 × 15)
  - At least `75 USDC` (5 × 15)

---

## ⚙️ Setup

1. **Clone this repo**

```bash
git clone https://github.com/lgalende/demo-accounts-setup.git
cd demo-accounts-setup
```

2. **Install dependencies**

```bash
npm install
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
npx ts-node src/setup-accounts.ts
```

This will:
- Generate 15 new random wallets
- Fund each with ETH and USDC
- Approve USDC and aUSDC to the SETTLER_ADDRESS
- Save:
    - `output/accounts-<timestamp>.txt` with all private keys and addresses
    - QR codes in `output/qr/account-<i>-<address>.png` (import into MetaMask mobile)

6. **Generate a PDF with QR codes and account info**

```bash
npx ts-node src/generate-qrs-pdf.ts
```

This will create:
- `output/accounts-<timestamp>.pdf`: one QR + address + PK per page
