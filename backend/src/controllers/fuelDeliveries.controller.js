import { supabase } from '../config/supabase.js'

export async function getApprovedVouchers(req, res) {
  try {
    const { data, error } = await supabase
      .from('fuel_vouchers')
      .select(`
        *,
        division:divisions(id, name),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({
      vouchers: data || []
    })
  } catch (error) {
    console.error('GET_APPROVED_VOUCHERS_ERROR =>', error)
    return res.status(500).json({
      error: 'Erreur chargement bons validés'
    })
  }
}

export async function searchVoucherByCode(req, res) {
  try {
    const { code } = req.query

    if (!code) {
      return res.status(400).json({
        error: 'Code bon requis'
      })
    }

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .select(`
        *,
        division:divisions(id, name),
        vehicle:vehicles(
          id,
          plate_number,
          label
        ),
        driver:users_profile!fuel_vouchers_driver_id_fkey(
          id,
          full_name
        )
      `)
      .ilike('voucher_number', `%${code}%`)
      .order('created_at', {
        ascending: false
      })
      .limit(10)

    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    return res.json({
      vouchers: data || []
    })
  } catch (error) {
    console.error(
      'SEARCH_VOUCHER_ERROR =>',
      error
    )

    return res.status(500).json({
      error:
        'Erreur recherche bon'
    })
  }
}

export async function deliverFuel(req, res) {
  try {
    const {
      voucherId,
      deliveredLiters,
      unitPrice,
      stationName,
      deliveryNotes
    } = req.body

    if (!voucherId || !deliveredLiters) {
      return res.status(400).json({
        error: 'Bon et quantité livrée requis'
      })
    }

    const { data: voucher, error: voucherError } = await supabase
  .from('fuel_vouchers')
  .select(`
    id,
    approved_liters,
    status
  `)
  .eq('id', voucherId)
  .single()

if (voucherError || !voucher) {
  return res.status(404).json({
    error: 'Bon introuvable'
  })
}

if (voucher.status !== 'approved') {
  return res.status(400).json({
    error: 'Ce bon n’est plus disponible'
  })
}

if (
  Number(deliveredLiters) >
  Number(voucher.approved_liters)
) {
  return res.status(400).json({
    error:
      'La quantité servie ne peut pas dépasser la quantité approuvée'
  })
}

    const totalAmount =
      Number(deliveredLiters) * Number(unitPrice || 0)

    const { data: delivery, error: deliveryError } = await supabase
      .from('fuel_deliveries')
      .insert({
        voucher_id: voucherId,
        pump_attendant_id: req.user.id,
        delivered_liters: Number(deliveredLiters),
        unit_price: Number(unitPrice || 0),
        total_amount: totalAmount,
        station_name: stationName || null,
        delivery_notes: deliveryNotes || null
      })
      .select('*')
      .single()

    if (deliveryError) {
      return res.status(400).json({
        error: deliveryError.message
      })
    }

    await supabase
      .from('fuel_vouchers')
      .update({
        status: 'used'
      })
      .eq('id', voucherId)

    return res.status(201).json({
      delivery
    })
  } catch (error) {
    console.error('DELIVER_FUEL_ERROR =>', error)

    return res.status(500).json({
      error: 'Erreur livraison carburant'
    })
  }
}