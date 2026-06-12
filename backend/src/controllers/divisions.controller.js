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