import { supabase } from '../config/supabase.js'
import { generateVoucherNumber } from '../utils/generateVoucherNumber.js'

export async function getFuelVouchers(req, res) {
  try {
    const { data, error } = await supabase
      .from('fuel_vouchers')
      .select(`
        *,
        division:divisions(id, name, code),
        vehicle:vehicles(id, plate_number, label, fuel_type),
        driver:users_profile!fuel_vouchers_driver_id_fkey(id, full_name, email),
        creator:users_profile!fuel_vouchers_created_by_fkey(id, full_name),
        approver:users_profile!fuel_vouchers_approved_by_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vouchers: data || [] })
  } catch (error) {
    console.error('GET_VOUCHERS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement bons' })
  }
}

export async function createFuelVoucher(req, res) {
  try {
    const {
      divisionId,
      vehicleId,
      driverId,
      fuelType,
      requestedLiters,
      notes
    } = req.body

    if (!divisionId || !vehicleId || !requestedLiters) {
      return res.status(400).json({ error: 'Division, véhicule et quantité requis' })
    }

    const voucherNumber = generateVoucherNumber('SNPT')

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .insert({
        voucher_number: voucherNumber,
        division_id: divisionId,
        vehicle_id: vehicleId,
        driver_id: driverId || null,
        created_by: req.user.id,
        fuel_type: fuelType || 'diesel',
        requested_liters: Number(requestedLiters),
        status: 'pending',
        notes: notes || null
      })
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ voucher: data })
  } catch (error) {
    console.error('CREATE_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création bon' })
  }
}

export async function approveFuelVoucher(req, res) {
  try {
    const { id } = req.params
    const { approvedLiters } = req.body

    if (!approvedLiters) {
      return res.status(400).json({ error: 'Quantité approuvée requise' })
    }

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .update({
        approved_liters: Number(approvedLiters),
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        status: 'approved'
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('APPROVE_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur validation bon' })
  }
}

export async function rejectFuelVoucher(req, res) {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('fuel_vouchers')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ voucher: data })
  } catch (error) {
    console.error('REJECT_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur refus bon' })
  }
}

export async function deleteFuelVoucher(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('fuel_vouchers')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Bon supprimé' })
  } catch (error) {
    console.error('DELETE_VOUCHER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression bon' })
  }
}