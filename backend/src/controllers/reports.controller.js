import { supabase } from '../config/supabase.js'
import { applyStructureScope } from '../utils/scope.js'

export async function getDeliveriesReport(req, res) {
  try {
    let query = supabase
      .from('fuel_deliveries')
      .select(`
        *,
        voucher:fuel_vouchers(
          voucher_number,
          fuel_type,
          requested_liters,
          approved_liters,
          division:divisions(name),
          vehicle:vehicles(plate_number, label)
        ),
        pompiste:users_profile!fuel_deliveries_pump_attendant_id_fkey(
          full_name
        )
      `)
      .order('delivered_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    const totalLiters = (data || []).reduce(
      (sum, item) =>
        sum + Number(item.delivered_liters || 0),
      0
    )

    const totalAmount = (data || []).reduce(
      (sum, item) =>
        sum + Number(item.total_amount || 0),
      0
    )

    return res.json({
      deliveries: data || [],
      stats: {
        totalDeliveries: data?.length || 0,
        totalLiters,
        totalAmount
      }
    })
  } catch (error) {
    console.error('REPORT_ERROR =>', error)

    return res.status(500).json({
      error: 'Erreur rapport'
    })
  }
}