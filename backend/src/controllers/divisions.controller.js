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
      .delete()
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Division supprimée' })
  } catch (error) {
    console.error('DELETE_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression division' })
  }
}