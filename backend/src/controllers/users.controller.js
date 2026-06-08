import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase.js'
import {
  applyStructureScope,
  resolveStructureIdForCreate,
  isSuperAdmin
} from '../utils/scope.js'

const rolesWithLogin = [
  'super_admin',
  'direction',
  'chef_division',
  'pompiste',
  'formateur'
]

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

    const needsLogin = rolesWithLogin.includes(role)

    if (!fullName || !role) {
      return res.status(400).json({
        error: 'Nom et rôle requis'
      })
    }

    if (needsLogin && (!email || !password)) {
      return res.status(400).json({
        error: 'Email et mot de passe requis pour ce rôle'
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

    const cleanEmail = needsLogin
  ? email.toLowerCase().trim()
  : `no-login-${Date.now()}-${Math.random().toString(36).slice(2)}@fuel.local`

const passwordHash = needsLogin
  ? await bcrypt.hash(password, 10)
  : await bcrypt.hash(`no-login-${Date.now()}-${Math.random()}`, 10)

const { data, error } = await supabase
  .from('users_profile')
  .insert({
    email: cleanEmail,
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