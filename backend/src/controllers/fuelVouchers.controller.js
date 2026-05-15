import { supabase } from '../config/supabase.js'
import {
  applyStructureScope,
  resolveStructureIdForCreate
} from '../utils/scope.js'

export async function getFuelVouchers(req, res) {
  try {
    let query = supabase
      .from('fuel_vouchers')
      .select(`
        id,
        voucher_number,
        vehicle_id,
        driver_name,
        quantity_liters,
        fuel_type,
        status,
        issued_at,
        used_at,
        division_id,
        structure_id,
        created_at,
        vehicle:vehicles(id, plate_number, brand, model),
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vouchers: data || [] })
  } catch (error) {
    console.error('GET_FUEL_VOUCHERS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement bons carburant' })
  }
}

export async function createFuelVoucher(req, res) {
  try {
    const {
      voucherNumber,
      vehicleId,
      driverName,
      quantityLiters,
      fuelType,
      divisionId
    } = req.body

    if (!vehicleId || !driverName || !quantityLiters) {
      return res.status(400).json({
        error: 'Véhicule, chauffeur et quantité requis'
      })
    }

    const structureId = resolveStructureIdForCreate(req, req.body)

    if (!structureId) {
      return res.status(400).json({ error: 'Structure obligatoire' })
    }

    const finalVoucherNumber =
      voucherNumber ||
      `BON-${Date.now().toString().slice(-8)}`

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .insert({
        voucher_number: finalVoucherNumber,
        vehicle_id: vehicleId,
        driver_name: driverName,
        quantity_liters: Number(quantityLiters),
        fuel_type: fuelType || 'diesel',
        division_id: divisionId || null,
        structure_id: structureId,
        status: 'issued',
        issued_at: new Date().toISOString()
      })
      .select(`
        id,
        voucher_number,
        vehicle_id,
        driver_name,
        quantity_liters,
        fuel_type,
        status,
        issued_at,
        used_at,
        division_id,
        structure_id,
        created_at,
        vehicle:vehicles(id, plate_number, brand, model),
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ voucher: data })
  } catch (error) {
    console.error('CREATE_FUEL_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création bon carburant' })
  }
}

export async function updateFuelVoucherStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Statut requis' })
    }

    const payload = { status }

    if (status === 'used') {
      payload.used_at = new Date().toISOString()
    }

    let query = supabase
      .from('fuel_vouchers')
      .update(payload)
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { data, error } = await query
      .select(`
        id,
        voucher_number,
        vehicle_id,
        driver_name,
        quantity_liters,
        fuel_type,
        status,
        issued_at,
        used_at,
        division_id,
        structure_id,
        created_at,
        vehicle:vehicles(id, plate_number, brand, model),
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('UPDATE_FUEL_VOUCHER_STATUS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur modification bon carburant' })
  }
}

export async function approveFuelVoucher(req, res) {
  req.body.status = 'approved'
  return updateFuelVoucherStatus(req, res)
}

export async function rejectFuelVoucher(req, res) {
  req.body.status = 'rejected'
  return updateFuelVoucherStatus(req, res)
}

export async function useFuelVoucher(req, res) {
  req.body.status = 'used'
  return updateFuelVoucherStatus(req, res)
}

export async function deleteFuelVoucher(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('fuel_vouchers')
      .delete()
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Bon carburant supprimé' })
  } catch (error) {
    console.error('DELETE_FUEL_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression bon carburant' })
  }
}