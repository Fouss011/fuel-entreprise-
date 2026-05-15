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
        *,
        division:divisions(id, name, code),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
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
    const vehicleId = req.body.vehicleId || req.body.vehicle_id
const driverId = req.body.driverId || req.body.driver_id
const divisionId = req.body.divisionId || req.body.division_id
const fuelType = req.body.fuelType || req.body.fuel_type
const requestedLiters =
  req.body.requestedLiters ||
  req.body.requested_liters ||
  req.body.quantityLiters ||
  req.body.quantity_liters

const approvedLiters =
  req.body.approvedLiters ||
  req.body.approved_liters

    if (!vehicleId || !driverId || !requestedLiters) {
      return res.status(400).json({
        error: 'Véhicule, chauffeur et quantité requis'
      })
    }

    const structureId = resolveStructureIdForCreate(req, req.body)

    if (!structureId) {
      return res.status(400).json({ error: 'Structure obligatoire' })
    }

    const voucherNumber = `BON-${Date.now().toString().slice(-8)}`

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .insert({
        voucher_number: voucherNumber,
        vehicle_id: vehicleId,
        driver_id: driverId,
        division_id: divisionId || null,
        fuel_type: fuelType || 'diesel',
        requested_liters: Number(requestedLiters),
        approved_liters: approvedLiters ? Number(approvedLiters) : null,
        status: 'pending',
        structure_id: structureId
      })
      .select(`
        *,
        division:divisions(id, name, code),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
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

export async function approveFuelVoucher(req, res) {
  try {
    const { id } = req.params
    const { approvedLiters } = req.body

    const payload = {
      status: 'approved',
      approved_at: new Date().toISOString()
    }

    if (approvedLiters) {
      payload.approved_liters = Number(approvedLiters)
    }

    let query = supabase
      .from('fuel_vouchers')
      .update(payload)
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { data, error } = await query
      .select(`
        *,
        division:divisions(id, name, code),
        vehicle:vehicles(id, plate_number, label),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name),
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('APPROVE_FUEL_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur validation bon carburant' })
  }
}

export async function rejectFuelVoucher(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('fuel_vouchers')
      .update({
        status: 'rejected'
      })
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { data, error } = await query
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('REJECT_FUEL_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur rejet bon carburant' })
  }
}

export async function useFuelVoucher(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('fuel_vouchers')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { data, error } = await query
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('USE_FUEL_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur utilisation bon carburant' })
  }
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