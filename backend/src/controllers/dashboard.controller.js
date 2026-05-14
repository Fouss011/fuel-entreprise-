import { supabase } from '../config/supabase.js'

export async function getDashboard(req, res) {
  try {
    const [
      divisionsResult,
      vehiclesResult,
      vouchersResult,
      deliveriesResult
    ] = await Promise.all([
      supabase.from('divisions').select('id', { count: 'exact', head: true }),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }),
      supabase.from('fuel_vouchers').select('id, status, requested_liters, approved_liters'),
      supabase.from('fuel_deliveries').select('id, delivered_liters, total_amount, delivered_at')
    ])

    const vouchers = vouchersResult.data || []
    const deliveries = deliveriesResult.data || []

    const totalRequestedLiters = vouchers.reduce(
      (sum, item) => sum + Number(item.requested_liters || 0),
      0
    )

    const totalDeliveredLiters = deliveries.reduce(
      (sum, item) => sum + Number(item.delivered_liters || 0),
      0
    )

    const totalAmount = deliveries.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    )

    const pendingVouchers = vouchers.filter(v => v.status === 'pending').length
    const approvedVouchers = vouchers.filter(v => v.status === 'approved').length
    const usedVouchers = vouchers.filter(v => v.status === 'used').length

    return res.json({
      stats: {
        totalDivisions: divisionsResult.count || 0,
        totalVehicles: vehiclesResult.count || 0,
        totalVouchers: vouchers.length,
        pendingVouchers,
        approvedVouchers,
        usedVouchers,
        totalRequestedLiters,
        totalDeliveredLiters,
        totalAmount
      }
    })
  } catch (error) {
    console.error('DASHBOARD_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur dashboard' })
  }
}