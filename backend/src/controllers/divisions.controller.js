import { supabase } from '../config/supabase.js'
import {
  applyStructureScope,
  resolveStructureIdForCreate
} from '../utils/scope.js'

export async function getDivisions(req, res) {
  try {
    let query = supabase
      .from('divisions')
      .select(`
        id,
        name,
        code,
        manager_name,
        structure_id,
        created_at,
        structure:structures(id, name, code)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ divisions: data || [] })
  } catch (error) {
    console.error('GET_DIVISIONS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement divisions' })
  }
}

export async function createDivision(req, res) {
  try {
    const { name, code, managerName } = req.body

    if (!name || !code) {
      return res.status(400).json({ error: 'Nom et code division requis' })
    }

    const structureId = resolveStructureIdForCreate(req, req.body)

    if (!structureId) {
      return res.status(400).json({ error: 'Structure obligatoire' })
    }

    const { data, error } = await supabase
      .from('divisions')
      .insert({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        manager_name: managerName || null,
        structure_id: structureId
      })
      .select(`
        id,
        name,
        code,
        manager_name,
        structure_id,
        created_at,
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ division: data })
  } catch (error) {
    console.error('CREATE_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création division' })
  }
}

export async function deleteDivision(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('divisions')
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
      division: data,
      message: 'Division archivée. Les anciens bons restent visibles dans les rapports.'
    })
  } catch (error) {
    console.error('ARCHIVE_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur archivage division' })
  }
}

export async function getArchivedDivisions(req, res) {
  try {
    let query = supabase
      .from('divisions')
      .select(`
        id,
        name,
        code,
        manager_name,
        structure_id,
        created_at,
        structure:structures(id, name, code)
      `)
      .eq('is_active', false)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ divisions: data || [] })
  } catch (error) {
    console.error('GET_ARCHIVED_DIVISIONS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement divisions archivées' })
  }
}

export async function restoreDivision(req, res) {
  try {
    const { id } = req.params

    let query = supabase
      .from('divisions')
      .update({ is_active: true })
      .eq('id', id)
      .select('*')
      .single()

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({
      division: data,
      message: 'Division restaurée'
    })
  } catch (error) {
    console.error('RESTORE_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur restauration division' })
  }
}

export async function deleteArchivedDivisionPermanently(req, res) {
  try {
    const { id } = req.params

    let checkQuery = supabase
      .from('fuel_vouchers')
      .select('id', { count: 'exact', head: true })
      .eq('division_id', id)

    checkQuery = applyStructureScope(checkQuery, req)

    const { count, error: checkError } = await checkQuery

    if (checkError) return res.status(400).json({ error: checkError.message })

    if (count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer définitivement : cette division est liée à un ou plusieurs bons.'
      })
    }

    let deleteQuery = supabase
      .from('divisions')
      .delete()
      .eq('id', id)
      .eq('is_active', false)

    deleteQuery = applyStructureScope(deleteQuery, req)

    const { error } = await deleteQuery

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Division supprimée définitivement' })
  } catch (error) {
    console.error('DELETE_ARCHIVED_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression définitive division' })
  }
}