import { supabase } from '../config/supabase.js'

export async function getVehicles(req, res) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        division:divisions(id, name, code),
        driver:users_profile(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

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
      divisionId,
      assignedDriverId
    } = req.body

    if (!plateNumber || !divisionId) {
      return res.status(400).json({ error: 'Immatriculation et division requises' })
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        plate_number: plateNumber.toUpperCase().trim(),
        label: label || null,
        vehicle_type: vehicleType || null,
        fuel_type: fuelType || 'diesel',
        division_id: divisionId,
        assigned_driver_id: assignedDriverId || null
      })
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ vehicle: data })
  } catch (error) {
    console.error('CREATE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création véhicule' })
  }
}

export async function deleteVehicle(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Véhicule supprimé' })
  } catch (error) {
    console.error('DELETE_VEHICLE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression véhicule' })
  }
}