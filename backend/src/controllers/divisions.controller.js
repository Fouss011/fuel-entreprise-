import { supabase } from '../config/supabase.js'

export async function getDivisions(req, res) {
  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('created_at', { ascending: false })

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
      return res.status(400).json({ error: 'Nom et code requis' })
    }

    const { data, error } = await supabase
      .from('divisions')
      .insert({
        name,
        code: code.toUpperCase().trim(),
        manager_name: managerName || null
      })
      .select('*')
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

    const { error } = await supabase
      .from('divisions')
      .delete()
      .eq('id', id)

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Division supprimée' })
  } catch (error) {
    console.error('DELETE_DIVISION_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression division' })
  }
}