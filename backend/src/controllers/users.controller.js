import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase.js'
import {
  applyStructureScope,
  resolveStructureIdForCreate,
  isSuperAdmin
} from '../utils/scope.js'

export async function getUsers(req, res) {
  try {
    let query = supabase
      .from('users_profile')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        division_id,
        structure_id,
        is_active,
        created_at,
        division:divisions(id, name, code),
        structure:structures(id, name, code)
      `)
      .order('created_at', { ascending: false })

    query = applyStructureScope(query, req)

    const { data, error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ users: data || [] })
  } catch (error) {
    console.error('GET_USERS_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur chargement utilisateurs' })
  }
}

export async function createUser(req, res) {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role,
      divisionId,
      structureId
    } = req.body

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        error: 'Email, mot de passe, nom et rôle requis'
      })
    }

    const finalStructureId = isSuperAdmin(req)
      ? structureId || null
      : resolveStructureIdForCreate(req, req.body)

    if (!finalStructureId && role !== 'super_admin') {
      return res.status(400).json({
        error: 'Structure obligatoire pour cet utilisateur'
      })
    }

    if (!isSuperAdmin(req) && role === 'super_admin') {
      return res.status(403).json({
        error: 'Seul le super admin peut créer un super admin'
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('users_profile')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName,
        phone: phone || null,
        role,
        division_id: divisionId || null,
        structure_id: finalStructureId
      })
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        division_id,
        structure_id,
        is_active,
        created_at,
        structure:structures(id, name, code)
      `)
      .single()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ user: data })
  } catch (error) {
    console.error('CREATE_USER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur création utilisateur' })
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Impossible de supprimer votre propre compte'
      })
    }

    let query = supabase
      .from('users_profile')
      .delete()
      .eq('id', id)

    query = applyStructureScope(query, req)

    const { error } = await query

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('DELETE_USER_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur suppression utilisateur' })
  }
}