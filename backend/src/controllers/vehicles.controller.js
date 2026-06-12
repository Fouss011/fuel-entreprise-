import { supabase } from '../config/supabase.js'
import {
  applyStructureScope,
  resolveStructureIdForCreate
} from '../utils/scope.js'

export async function getVehicles(req, res) {
  try {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vehicles: data || [] })
  } catch (error) {
    console.error('GET_VEHICLES_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement véhicules' })
  }
}

export async function createVehicle(req, res) {
  try {
    const {
      plateNumber,
      label,
      vehicleType,
      fuelType,
      divisionId
    } = req.body

    if (!plateNumber) {
      return res.status(400).json({ error: 'Immatriculation requise' })
    }

    const structureId = resolveStructureIdForCreate(req, req.body)

    if (!structureId) {
      return res.status(400).json({ error: 'Structure obligatoire' })
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        plate_number: plateNumber.toUpperCase().trim(),
        label: label || null,
        vehicle_type: vehicleType || null,
        fuel_type: fuelType || 'diesel',
        division_id: divisionId || null,
        structure_id: structureId
      })
      .select(`
        *,
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ vehicle: data })
  } catch (error) {
    console.error('CREATE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création véhicule' })
  }
}

export async function updateVehicle(req, res) {
  try {
    const { id } = req.params

    const {
      plateNumber,
      label,
      vehicleType,
      fuelType,
      divisionId
    } = req.body

    if (!plateNumber) {
      return res.status(400).json({ error: 'Immatriculation requise' })
    }

    let query = supabase
      .from('vehicles')
      .update({
        plate_number: plateNumber.toUpperCase().trim(),
        label: label || null,
        vehicle_type: vehicleType || null,
        fuel_type: fuelType || 'diesel',
        division_id: divisionId || null
      })
      .eq('id', id)
      .select(`
        *,
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .single()

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vehicle: data })
  } catch (error) {
    console.error('UPDATE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur modification véhicule' })
  }
}

export async function deleteVehicle(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('vehicles')
      .update({
        is_active: false
      })
      .eq('id', id)
      .select('*')
      .single()

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({
      vehicle: data,
      message: 'Véhicule archivé. Les anciens bons restent visibles dans les rapports.'
    })
  } catch (error) {
    console.error('ARCHIVE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur archivage véhicule' })
  }
}

export async function getArchivedVehicles(req, res) {
  try {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .eq('is_active', false)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ vehicles: data || [] })
  } catch (error) {
    console.error('GET_ARCHIVED_VEHICLES_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement véhicules archivés' })
  }
}

export async function restoreVehicle(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('vehicles')
      .update({ is_active: true })
      .eq('id', id)
      .select('*')
      .single()

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({
      vehicle: data,
      message: 'Véhicule restauré'
    })
  } catch (error) {
    console.error('RESTORE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur restauration véhicule' })
  }
}

export async function deleteArchivedVehiclePermanently(req, res) {
  try {
    const { id } = req.params

    let checkQuery = supabase
      .from('fuel_vouchers')
      .select('id', { count: 'exact', head: true })
      .eq('vehicle_id', id)

    checkQuery = applyStructureScope(checkQuery, req)

    const { count, error: checkError } = await checkQuery

    if (checkError) return res.status(400).json({ error: checkError.message })

    if (count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer définitivement : ce véhicule est lié à un ou plusieurs bons.'
      })
    }

    let deleteQuery = supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('is_active', false)

    deleteQuery = applyStructureScope(deleteQuery, req)

    const { error } = await deleteQuery

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Véhicule supprimé définitivement' })
  } catch (error) {
    console.error('DELETE_ARCHIVED_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression définitive véhicule' })
  }
}