import dotenv from 'dotenv'
dotenv.config()

import { Wallet, parseUnits, MaxUint256, JsonRpcProvider } from 'ethers'
import { Contract } from 'ethers'
import * as QRCode from 'qrcode'
import fs from 'fs/promises'

const USDC_ADDRESS = '0x7f5c764cbc14f9669b88837ca1490cca17c31607' // USDC.e (underlying asset of aOptUSDC)
const AUSDC_ADDRESS = '0x625E7708f30cA75bfd92586e17077590C60eb4cD' // aOptUSDC
const SETTLER_ADDRESS = '0xdcF1D9d12A0488dFb70A8696f44d6D3Bc303963D'
const AMOUNT_USDC = parseUnits('5', 6)        // 5 USDC (6 decimals)
const AMOUNT_ETH = parseUnits('0.0001', 18)   // 0.0001 ETH ~ 0.25 USD
const TOTAL_ACCOUNTS = 15

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function approve(address spender, uint256 amount) public returns (bool)',
]

async function main() {
  const RPC_URL = process.env.RPC_URL || 'https://mainnet.optimism.io'
  const PRIVATE_KEY = process.env.PRIVATE_KEY

  if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY in .env file')

  await fs.mkdir('output/qr', { recursive: true })

  const provider = new JsonRpcProvider(RPC_URL)
  const funder = new Wallet(PRIVATE_KEY, provider)

  const accounts = Array.from({ length: TOTAL_ACCOUNTS }, () => Wallet.createRandom())

  const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, provider)
  const ausdc = new Contract(AUSDC_ADDRESS, ERC20_ABI, provider)

  for (const [i, wallet] of accounts.entries()) {
    console.log(`\n🔹 Setting up Account ${i + 1}: ${wallet.address}`)

    // Send USDC
    const txUsdc = await usdc.connect(funder).getFunction('transfer')(wallet.address, AMOUNT_USDC)
    await txUsdc.wait()
    console.log(`✅ USDC sent: ${AMOUNT_USDC.toString()} units`)

    // Send ETH
    const txEth = await funder.sendTransaction({
      to: wallet.address,
      value: AMOUNT_ETH,
    })
    await txEth.wait()
    console.log(`✅ ETH sent: ${AMOUNT_ETH.toString()} wei`)

    // Connect wallet to sign approvals
    const signer = wallet.connect(provider)

    const approveUSDC = await usdc.connect(signer).getFunction('approve')(SETTLER_ADDRESS, MaxUint256)
    await approveUSDC.wait()
    console.log('✅ Infinite USDC approval granted')

    const approveAUSDC = await ausdc.connect(signer).getFunction('approve')(SETTLER_ADDRESS, MaxUint256)
    await approveAUSDC.wait()
    console.log('✅ Infinite aUSDC approval granted')

    // Generate QR code
    const qrPath = `output/qr/account-${i + 1}-${wallet.address}.png`
    await QRCode.toFile(qrPath, wallet.privateKey)
    console.log(`📱 QR code saved: ${qrPath}`)
  }

  // Save private keys
  const output = accounts
    .map((a, i) => `Account ${i + 1}:\nAddress: ${a.address}\nPrivate Key: ${a.privateKey}`)
    .join('\n\n')
  const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-')
  const filename = `output/accounts-${timestamp}.txt`
  await fs.writeFile(filename, output)
  console.log(`\n🔐 All private keys saved to ${filename}`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
})
