import { supabase } from '../config/supabase.js'
import { applyStructureScope, getUserStructureId } from '../utils/scope.js'

export async function getApprovedVouchers(req, res) {
  try {
    let query = supabase
      .from('fuel_vouchers')
      .select(`
        *,
        division:divisions(id, name),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
        structure:structures(id, name, code)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vouchers: data || [] })
  } catch (error) {
    console.error('GET_APPROVED_VOUCHERS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement bons validés' })
  }
}

export async function searchVoucherByCode(req, res) {
  try {
    const { code } = req.query

    if (!code) {
      return res.status(400).json({ error: 'Code bon requis' })
    }

    let query = supabase
      .from('fuel_vouchers')
      .select(`
        *,
        division:divisions(id, name),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
        structure:structures(id, name, code)
      `)
      .eq('status', 'approved')
      .ilike('voucher_number', `%${code}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vouchers: data || [] })
  } catch (error) {
    console.error('SEARCH_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur recherche bon' })
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

    const structureId = getUserStructureId(req)

    if (!structureId && req.user.role !== 'super_admin') {
      return res.status(400).json({
        error: 'Structure utilisateur manquante'
      })
    }

    let voucherQuery = supabase
      .from('fuel_vouchers')
      .select(`
        id,
        approved_liters,
        status,
        structure_id
      `)
      .eq('id', voucherId)
      .eq('status', 'approved')

    if (req.user.role !== 'super_admin') {
      voucherQuery = voucherQuery.eq('structure_id', structureId)
    }

    const { data: voucher, error: voucherError } = await voucherQuery.single()

    if (voucherError || !voucher) {
      return res.status(404).json({
        error: 'Bon introuvable ou déjà utilisé'
      })
    }

    if (Number(deliveredLiters) > Number(voucher.approved_liters)) {
      return res.status(400).json({
        error: 'La quantité servie ne peut pas dépasser la quantité approuvée'
      })
    }

    const finalStructureId = voucher.structure_id || structureId
    const totalAmount = Number(deliveredLiters) * Number(unitPrice || 0)

    const { data: delivery, error: deliveryError } = await supabase
      .from('fuel_deliveries')
      .insert({
        voucher_id: voucherId,
        pump_attendant_id: req.user.id,
        delivered_liters: Number(deliveredLiters),
        unit_price: Number(unitPrice || 0),
        total_amount: totalAmount,
        station_name: stationName || null,
        delivery_notes: deliveryNotes || null,
        structure_id: finalStructureId
      })
      .select('*')
      .single()

    if (deliveryError) {
      return res.status(400).json({
        error: deliveryError.message
      })
    }

    const { error: updateVoucherError } = await supabase
      .from('fuel_vouchers')
      .update({
        status: 'used'
      })
      .eq('id', voucherId)
      .eq('status', 'approved')
      .eq('structure_id', finalStructureId)

    if (updateVoucherError) {
      return res.status(400).json({
        error: updateVoucherError.message
      })
    }

    return res.status(201).json({ delivery })
  } catch (error) {
    console.error('DELIVER_FUEL_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur livraison carburant' })
  }
}

export async function getFuelDeliveries(req, res) {
  try {
    let query = supabase
      .from('fuel_deliveries')
      .select(`
        *,
        voucher:fuel_vouchers(
          id,
          voucher_number,
          approved_liters,
          requested_liters,
          status,
          driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
          vehicle:vehicles(id, plate_number, label),
          division:divisions(id, name)
        ),
        pompiste:users_profile!fuel_deliveries_pump_attendant_id_fkey(id, full_name),
        structure:structures(id, name, code)
      `)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ deliveries: data || [] })
  } catch (error) {
    console.error('GET_FUEL_DELIVERIES_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement livraisons' })
  }
}

export async function deleteFuelDelivery(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('fuel_deliveries')
      .delete()
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Livraison supprimée' })
  } catch (error) {
    console.error('DELETE_FUEL_DELIVERY_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression livraison' })
  }
}