import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      divisionId: user.division_id,
      structureId: user.structure_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    const cleanEmail = email.toLowerCase().trim()

    const { data: user, error } = await supabase
      .from('users_profile')
      .select(`
        *,
        structure:structures(id, name, code, is_active)
      `)
      .eq('email', cleanEmail)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Compte désactivé' })
    }

    if (
      user.role !== 'super_admin' &&
      (!user.structure || user.structure.is_active === false)
    ) {
      return res.status(403).json({
        error: 'Structure inactive ou introuvable'
      })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    const token = signToken(user)

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        divisionId: user.division_id,
        structureId: user.structure_id,
        structure: user.structure || null
      }
    })
  } catch (error) {
    console.error('LOGIN_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur connexion' })
  }
}

export async function me(req, res) {
  try {
    const { data: user, error } = await supabase
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
        structure:structures(id, name, code)
      `)
      .eq('id', req.user.id)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }

    return res.json({ user })
  } catch (error) {
    console.error('ME_ERROR =>', error)
    return res.status(500).json({ error: 'Erreur profil' })
  }
}