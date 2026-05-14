export function generateVoucherNumber(prefix = 'SNPT') {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)

  return `${prefix}-${year}-${month}-${random}`
}