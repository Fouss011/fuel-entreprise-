import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import {
  createUser,
  deleteUser,
  getDivisions,
  getUsers
} from '../api/api'

const roles = [
  { value: 'super_admin', label: 'Super admin' },
  { value: 'direction', label: 'Direction' },
  { value: 'chef_division', label: 'Chef de division' },
  { value: 'chauffeur', label: 'Chauffeur / bénéficiaire' },
  { value: 'pompiste', label: 'Pompiste' },
  { value: 'comptabilite', label: 'Comptabilité / Audit' }
]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [divisions, setDivisions] = useState([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('123456')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('chauffeur')
  const [divisionId, setDivisionId] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const [usersData, divisionsData] = await Promise.all([
      getUsers(),
      getDivisions()
    ])

    setUsers(usersData.users || [])
    setDivisions(divisionsData.divisions || [])

    if (!divisionId && divisionsData.divisions?.[0]) {
      setDivisionId(divisionsData.divisions[0].id)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await createUser({
      email,
      password,
      fullName,
      phone,
      role,
      divisionId
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setEmail('')
    setPassword('123456')
    setFullName('')
    setPhone('')
    setRole('chauffeur')
    await loadData()
    setLoading(false)
  }

  async function handleDelete(id) {
  if (!window.confirm('Supprimer cet utilisateur ?')) return

  const data = await deleteUser(id)

  if (data.error) {
    setError(data.error)
    return
  }

  await loadData()
}

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Sécurité & accès</p>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            Crée les comptes des responsables, chauffeurs, pompistes et agents de contrôle.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des utilisateurs</h3>
          <p className="panel-subtitle">Comptes actifs de la plateforme.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            {users.map((user) => (
  <EntityCard
    key={user.id}
    title={user.full_name}
    subtitle={user.email}
    badge="SUPPRIMER"
    badgeTone="danger"
    onAction={() => handleDelete(user.id)}
    items={[
      {
        label: 'Rôle',
        value: user.role
      },
      {
        label: 'Division',
        value: user.division?.name || '-'
      },
      {
        label: 'Statut',
        value: user.is_active ? 'Actif' : 'Désactivé'
      }
    ]}
  />
))}

            {users.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucun utilisateur enregistré.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Créer un utilisateur</h3>
          <p className="panel-subtitle">Attribue un rôle et une division.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
              className="form-input"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="form-input"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
              className="form-input"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe temporaire"
              className="form-input"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              {roles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="form-input"
            >
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>

            {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer l’utilisateur'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}