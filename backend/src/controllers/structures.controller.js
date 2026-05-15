import { supabase } from '../config/supabase.js'

export async function getStructures(req, res) {
  try {
    const { data, error } = await supabase
      .from('structures')
      .select('id, name, code, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ structures: data || [] })
  } catch (error) {
    console.error('GET_STRUCTURES_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement structures' })
  }
}

export async function createStructure(req, res) {
  try {
    const { name, code } = req.body

    if (!name || !code) {
      return res.status(400).json({ error: 'Nom et code structure requis' })
    }

    const { data, error } = await supabase
      .from('structures')
      .insert({
        name: name.trim(),
        code: code.toUpperCase().trim()
      })
      .select('id, name, code, is_active, created_at')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ structure: data })
  } catch (error) {
    console.error('CREATE_STRUCTURE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création structure' })
  }
}

export async function updateStructure(req, res) {
  try {
    const { id } = req.params
    const { name, code, isActive } = req.body

    const payload = {}

    if (name !== undefined) payload.name = name.trim()
    if (code !== undefined) payload.code = code.toUpperCase().trim()
    if (isActive !== undefined) payload.is_active = Boolean(isActive)

    const { data, error } = await supabase
      .from('structures')
      .update(payload)
      .eq('id', id)
      .select('id, name, code, is_active, created_at')
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ structure: data })
  } catch (error) {
    console.error('UPDATE_STRUCTURE_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur modification structure' })
  }
}