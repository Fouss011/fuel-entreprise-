import { supabase } from '../config/supabase.js'

export async function getVehicleHistory(req, res) {
  try {
    const { vehicleId, month } = req.query

    if (!vehicleId) {
      return res.status(400).json({ error: 'Véhicule requis' })
    }

    let query = supabase
      .from('fuel_deliveries')
      .select(`
        *,
        voucher:fuel_vouchers(
          voucher_number,
          requested_liters,
          approved_liters,
          fuel_type,
          division:divisions(id, name, code),
          vehicle:vehicles(id, plate_number, label, vehicle_type),
          driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name)
        ),
        pompiste:users_profile!fuel_deliveries_pump_attendant_id_fkey(id, full_name)
      `)
      .eq('voucher.vehicle_id', vehicleId)
      .order('delivered_at', { ascending: false })

    if (month) {
      const startDate = `${month}-01T00:00:00.000Z`
      const end = new Date(startDate)
      end.setUTCMonth(end.getUTCMonth() + 1)

      query = query
        .gte('delivered_at', startDate)
        .lt('delivered_at', end.toISOString())
    }

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    const deliveries = (data || []).filter(
      (item) => item.voucher?.vehicle?.id === vehicleId
    )

    const summary = {
      totalDeliveries: deliveries.length,
      totalLiters: deliveries.reduce(
        (sum, item) => sum + Number(item.delivered_liters || 0),
        0
      ),
      totalAmount: deliveries.reduce(
        (sum, item) => sum + Number(item.total_amount || 0),
        0
      )
    }

    return res.json({
      summary,
      deliveries
    })
  } catch (error) {
    console.error('VEHICLE_HISTORY_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur historique véhicule' })
  }
}