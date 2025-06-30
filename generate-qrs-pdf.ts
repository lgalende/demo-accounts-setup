import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(__dirname, 'output')
const QR_DIR = path.join(OUTPUT_DIR, 'qr')
const QR_SIZE = 300

// 🆕 Set this to match the accounts file you want to load
const ACCOUNTS_FILE = path.join(OUTPUT_DIR, 'accounts-2025-06-30T18-17-17.txt')

interface Account {
  index: number
  address: string
  privateKey: string
}

async function generateQRCodePDF() {
  const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-')
  const pdfPath = path.join(OUTPUT_DIR, `accounts-${timestamp}.pdf`)

  const doc = new PDFDocument({ autoFirstPage: false })
  const stream = fs.createWriteStream(pdfPath)
  doc.pipe(stream)

  // 🧾 Parse the accounts file
  const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8')
  const blocks = raw.trim().split(/\n\s*\n/)
  const accounts: Account[] = blocks.map((block, i) => {
    const matchAddress = block.match(/Address:\s*(0x[a-fA-F0-9]{40})/)
    const matchKey = block.match(/Private Key:\s*(0x[a-fA-F0-9]{64})/)
    if (!matchAddress || !matchKey) throw new Error(`Invalid block for account ${i + 1}`)
    return {
      index: i + 1,
      address: matchAddress[1],
      privateKey: matchKey[1],
    }
  })

  for (const { index, address, privateKey } of accounts) {
    const filename = `account-${index}-${address}.png`
    const qrPath = path.join(QR_DIR, filename)

    if (!fs.existsSync(qrPath)) {
      console.warn(`⚠️ Skipping missing QR: ${qrPath}`)
      continue
    }

    doc.addPage()

    const pageWidth = doc.page.width
    const pageHeight = doc.page.height
    const qrX = (pageWidth - QR_SIZE) / 2
    const qrY = (pageHeight - QR_SIZE) / 2 - 80

    doc.image(qrPath, qrX, qrY, { width: QR_SIZE, height: QR_SIZE })

    const textY = qrY + QR_SIZE + 20

    doc.fontSize(14).text(`Account ${index}`, 0, textY, {
    align: 'center',
    width: pageWidth,
    })

    doc.fontSize(12).text(`Address: ${address}`, 0, textY + 20, {
    align: 'center',
    width: pageWidth,
    })

    doc.fontSize(12).text(`Private Key: ${privateKey}`, 0, textY + 40, {
    align: 'center',
    width: pageWidth,
    })
  }

  doc.end()
  await new Promise<void>((resolve) => stream.on('finish', () => resolve()))
  console.log(`✅ PDF saved to: ${pdfPath}`)
}

generateQRCodePDF().catch((err) => {
  console.error('❌ Failed to generate PDF:', err)
})
