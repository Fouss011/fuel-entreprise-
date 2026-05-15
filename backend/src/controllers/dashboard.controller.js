import { supabase } from '../config/supabase.js'
import { applyStructureScope } from '../utils/scope.js'

export async function getDashboard(req, res) {
  try {
    let divisionsQuery = supabase
      .from('divisions')
      .select('id', { count: 'exact', head: true })

    let vehiclesQuery = supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })

    let vouchersQuery = supabase
      .from('fuel_vouchers')
      .select('id, status, requested_liters, approved_liters, structure_id')

    let deliveriesQuery = supabase
      .from('fuel_deliveries')
      .select('id, delivered_liters, total_amount, delivered_at, structure_id')

    divisionsQuery = applyStructureScope(divisionsQuery, req)
    vehiclesQuery = applyStructureScope(vehiclesQuery, req)
    vouchersQuery = applyStructureScope(vouchersQuery, req)
    deliveriesQuery = applyStructureScope(deliveriesQuery, req)

    const [
      divisionsResult,
      vehiclesResult,
      vouchersResult,
      deliveriesResult
    ] = await Promise.all([
      divisionsQuery,
      vehiclesQuery,
      vouchersQuery,
      deliveriesQuery
    ])

    if (divisionsResult.error) {
      return res.status(400).json({ error: divisionsResult.error.message })
    }

    if (vehiclesResult.error) {
      return res.status(400).json({ error: vehiclesResult.error.message })
    }

    if (vouchersResult.error) {
      return res.status(400).json({ error: vouchersResult.error.message })
    }

    if (deliveriesResult.error) {
      return res.status(400).json({ error: deliveriesResult.error.message })
    }

    const vouchers = vouchersResult.data || []
    const deliveries = deliveriesResult.data || []

    const totalRequestedLiters = vouchers.reduce(
      (sum, item) => sum + Number(item.requested_liters || 0),
      0
    )

    const totalApprovedLiters = vouchers.reduce(
      (sum, item) => sum + Number(item.approved_liters || 0),
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

    const pendingVouchers = vouchers.filter((v) => v.status === 'pending').length
    const approvedVouchers = vouchers.filter((v) => v.status === 'approved').length
    const usedVouchers = vouchers.filter((v) => v.status === 'used').length
    const rejectedVouchers = vouchers.filter((v) => v.status === 'rejected').length

    return res.json({
      stats: {
        totalDivisions: divisionsResult.count || 0,
        totalVehicles: vehiclesResult.count || 0,
        totalVouchers: vouchers.length,
        pendingVouchers,
        approvedVouchers,
        usedVouchers,
        rejectedVouchers,
        totalRequestedLiters,
        totalApprovedLiters,
        totalDeliveredLiters,
        totalAmount
      }
    })
  } catch (error) {
    console.error('DASHBOARD_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur dashboard' })
  }
}