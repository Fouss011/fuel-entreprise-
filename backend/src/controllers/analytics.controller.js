import { supabase } from '../config/supabase.js'

export async function getAnalytics(req, res) {
  try {
    const { data, error } = await supabase
      .from('fuel_deliveries')
      .select(`
        *,
        voucher:fuel_vouchers(
          voucher_number,
          approved_liters,
          requested_liters,
          division:divisions(name),
          vehicle:vehicles(
            id,
            plate_number,
            label
          )
        )
      `)

    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    const deliveries = data || []

    const vehicleStats = {}

    const anomalies = []

    for (const item of deliveries) {
      const vehicle =
        item.voucher?.vehicle

      if (!vehicle) continue

      if (!vehicleStats[vehicle.id]) {
        vehicleStats[vehicle.id] = {
          vehicleId: vehicle.id,
          plateNumber:
            vehicle.plate_number,
          label: vehicle.label,
          totalLiters: 0,
          totalAmount: 0,
          totalDeliveries: 0
        }
      }

      vehicleStats[vehicle.id].totalLiters +=
        Number(item.delivered_liters || 0)

      vehicleStats[vehicle.id].totalAmount +=
        Number(item.total_amount || 0)

      vehicleStats[vehicle.id].totalDeliveries += 1

      const approved =
        Number(
          item.voucher?.approved_liters || 0
        )

      const delivered =
        Number(item.delivered_liters || 0)

      if (delivered > approved) {
        anomalies.push({
          type: 'OVER_DELIVERY',
          voucherNumber:
            item.voucher?.voucher_number,
          plateNumber:
            vehicle.plate_number,
          approved,
          delivered
        })
      }

      if (delivered <= 0) {
        anomalies.push({
          type: 'ZERO_DELIVERY',
          voucherNumber:
            item.voucher?.voucher_number,
          plateNumber:
            vehicle.plate_number
        })
      }
    }

    const topVehicles =
      Object.values(vehicleStats)
        .sort(
          (a, b) =>
            b.totalLiters -
            a.totalLiters
        )
        .slice(0, 10)

    return res.json({
      topVehicles,
      anomalies
    })
  } catch (error) {
    console.error(
      'ANALYTICS_ERROR =>',
      error
    )

    return res.status(500).json({
      error:
        'Erreur analytics carburant'
    })
  }
}