import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import {
  createUser,
  deleteUser,
  getDivisions,
  getStructures,
  getUsers
} from '../api/api'

const roles = [
  { value: 'direction', label: 'Direction' },
  { value: 'chef_division', label: 'Chef de division' },
  { value: 'chauffeur', label: 'Chauffeur / bénéficiaire' },
  { value: 'pompiste', label: 'Pompiste' },
  { value: 'comptabilite', label: 'Comptabilité / Audit' }
]

const superAdminRoles = [
  { value: 'super_admin', label: 'Super admin' },
  ...roles
]

export default function UsersPage() {
  const currentUser = JSON.parse(localStorage.getItem('fuel_user') || '{}')
  const isSuperAdmin = currentUser.role === 'super_admin'

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [divisions, setDivisions] = useState([])
  const [structures, setStructures] = useState([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('123456')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState(isSuperAdmin ? 'direction' : 'chauffeur')
  const [divisionId, setDivisionId] = useState('')
  const [structureId, setStructureId] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadData() {
    setError('')

    const requests = [getUsers(), getDivisions()]

    if (isSuperAdmin) {
      requests.push(getStructures())
    }

    const results = await Promise.all(requests)

    const usersData = results[0]
    const divisionsData = results[1]
    const structuresData = results[2]

    if (usersData.error) setError(usersData.error)
    if (divisionsData.error) setError(divisionsData.error)

    setUsers(usersData.users || [])
    setDivisions(divisionsData.divisions || [])

    if (isSuperAdmin) {
      if (structuresData?.error) setError(structuresData.error)

      const loadedStructures = structuresData?.structures || []
      setStructures(loadedStructures)

      if (!structureId && loadedStructures[0]) {
        setStructureId(loadedStructures[0].id)
      }
    }

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

    if (isSuperAdmin && role !== 'super_admin' && !structureId) {
      setError('Choisis une structure pour cet utilisateur.')
      setLoading(false)
      return
    }

    const payload = {
      email,
      password,
      fullName,
      phone,
      role,
      divisionId: divisionId || null
    }

    if (isSuperAdmin) {
      payload.structureId = role === 'super_admin' ? null : structureId
    }

    const data = await createUser(payload)

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setEmail('')
    setPassword('123456')
    setFullName('')
    setPhone('')
    setRole(isSuperAdmin ? 'direction' : 'chauffeur')
    setDivisionId('')
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

  const availableRoles = isSuperAdmin ? superAdminRoles : roles

  const filteredUsers = users.filter((user) => {
  const text = search.toLowerCase()

  return (
    user.full_name?.toLowerCase().includes(text) ||
    user.email?.toLowerCase().includes(text) ||
    user.phone?.toLowerCase().includes(text) ||
    user.role?.toLowerCase().includes(text) ||
    user.division?.name?.toLowerCase().includes(text)
  )
})

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
          <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Rechercher utilisateur, email, téléphone..."
  className="form-input"
  style={{
    marginTop: 14,
    marginBottom: 16
  }}
/>
          <p className="panel-subtitle">Comptes actifs de la plateforme.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredUsers.map((user) => (
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
                    label: 'Structure',
                    value: user.structure?.name || '-'
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

            {filteredUsers.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucun utilisateur enregistré.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Créer un utilisateur</h3>
          <p className="panel-subtitle">
            {isSuperAdmin
              ? 'Choisis la structure, puis attribue un rôle.'
              : 'L’utilisateur sera automatiquement rattaché à ta structure.'}
          </p>

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
              {availableRoles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {isSuperAdmin && role !== 'super_admin' && (
              <select
                value={structureId}
                onChange={(e) => setStructureId(e.target.value)}
                className="form-input"
              >
                <option value="">Choisir une structure</option>
                {structures.map((structure) => (
                  <option key={structure.id} value={structure.id}>
                    {structure.name} ({structure.code})
                  </option>
                ))}
              </select>
            )}

            {role !== 'super_admin' && divisions.length > 0 && (
              <select
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className="form-input"
              >
                <option value="">Aucune division</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            )}

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer l’utilisateur'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}