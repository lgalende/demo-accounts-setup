import dotenv from 'dotenv'
dotenv.config()

import { Wallet, JsonRpcProvider } from 'ethers'
import { Contract } from 'ethers'
import fs from 'fs/promises'

const FUNDING_ADDRESS = '0x62408AA09ccBaADcD53cb59fe93b2265902CAcEa'
const USDC_ADDRESS = '0x7f5c764cbc14f9669b88837ca1490cca17c31607' // USDC.e (underlying asset of aOptUSDC)
const AUSDC_ADDRESS = '0x625E7708f30cA75bfd92586e17077590C60eb4cD' // aOptUSDC
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
]

async function main() {
  const RPC_URL = process.env.RPC_URL || 'https://mainnet.optimism.io'

  const provider = new JsonRpcProvider(RPC_URL)
  const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, provider)
  const ausdc = new Contract(AUSDC_ADDRESS, ERC20_ABI, provider)

  // Load private keys from `/output/accounts-*.txt` file
  const files = await fs.readdir('output')
  const latestFile = files
    .filter(f => f.startsWith('accounts-') && f.endsWith('.txt'))
    .sort()
    .pop()

  if (!latestFile) throw new Error('No accounts file found')
  const content = await fs.readFile(`output/${latestFile}`, 'utf-8')

  // Get PKs from lines starting with "Private Key:"
  const privateKeys = content
    .split('\n')
    .filter(line => line.startsWith('Private Key:'))
    .map(line => line.split('Private Key: ')[1].trim())

  for (const [i, pk] of privateKeys.entries()) {
    const wallet = new Wallet(pk, provider)

    await transferToFunder(wallet, usdc, 'USDC', i)
    await transferToFunder(wallet, ausdc, 'aOptUSDC', i)
  }
}

async function transferToFunder(wallet: Wallet, token: Contract, symbol: string, i: number) {
  const balance = await token.balanceOf(wallet.address)
    
  if (balance > 0n) {
    console.log(`🔁 Account ${i + 1}: ${wallet.address} has ${balance.toString()} ${symbol}`)
    const tx = await token.connect(wallet).getFunction('transfer')(FUNDING_ADDRESS, balance)
    await tx.wait()
    console.log(`✅ Transferred ${balance.toString()} ${symbol} back to funder`)
  } else {
    console.log(`⚠️ Account ${i + 1}: ${wallet.address} has 0 ${symbol}`)
  }
}

main().catch(err => console.error('❌ Error:', err))
