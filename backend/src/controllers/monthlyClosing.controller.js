import { supabase } from '../config/supabase.js'
import { applyStructureScope } from '../utils/scope.js'

export async function getMonthlyClosing(req, res) {
  try {
    const { month } = req.query

    if (!month) {
      return res.status(400).json({ error: 'Mois requis au format YYYY-MM' })
    }

    const startDate = `${month}-01T00:00:00.000Z`
    const end = new Date(startDate)
    end.setUTCMonth(end.getUTCMonth() + 1)
    const endDate = end.toISOString()

    let query = supabase
      .from('fuel_deliveries')
      .select(`
        *,
        voucher:fuel_vouchers(
          voucher_number,
          division:divisions(id, name, code),
          vehicle:vehicles(id, plate_number, label)
        ),
        pompiste:users_profile!fuel_deliveries_pump_attendant_id_fkey(id, full_name)
      `)
      .gte('delivered_at', startDate)
      .lt('delivered_at', endDate)
      .order('delivered_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    const deliveries = data || []

    const summary = {
      month,
      totalDeliveries: deliveries.length,
      totalLiters: deliveries.reduce(
        (sum, item) => sum + Number(item.delivered_liters || 0),
        0
      ),
      totalOdometer: deliveries.reduce(
        (sum, item) => sum + Number(item.odometer_km || 0),
        0
      )
    }

    const byVehicleMap = {}
    const byDivisionMap = {}

    for (const item of deliveries) {
      const vehicle = item.voucher?.vehicle
      const division = item.voucher?.division
      const odometer = Number(item.odometer_km || 0)

      if (vehicle) {
        if (!byVehicleMap[vehicle.id]) {
          byVehicleMap[vehicle.id] = {
            id: vehicle.id,
            plateNumber: vehicle.plate_number,
            label: vehicle.label,
            totalLiters: 0,
            totalOdometer: 0,
            deliveries: 0
          }
        }

        byVehicleMap[vehicle.id].totalLiters += Number(item.delivered_liters || 0)
        byVehicleMap[vehicle.id].totalOdometer += odometer
        byVehicleMap[vehicle.id].deliveries += 1
      }

      if (division) {
        if (!byDivisionMap[division.id]) {
          byDivisionMap[division.id] = {
            id: division.id,
            name: division.name,
            code: division.code,
            totalLiters: 0,
            totalOdometer: 0,
            deliveries: 0
          }
        }

        byDivisionMap[division.id].totalLiters += Number(item.delivered_liters || 0)
        byDivisionMap[division.id].totalOdometer += odometer
        byDivisionMap[division.id].deliveries += 1
      }
    }

    return res.json({
      summary,
      byVehicle: Object.values(byVehicleMap).sort((a, b) => b.totalLiters - a.totalLiters),
      byDivision: Object.values(byDivisionMap).sort((a, b) => b.totalLiters - a.totalLiters),
      deliveries
    })
  } catch (error) {
    console.error('MONTHLY_CLOSING_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur clôture mensuelle' })
  }
}