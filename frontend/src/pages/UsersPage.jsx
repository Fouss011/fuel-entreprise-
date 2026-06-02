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
  { value: 'comptabilite', label: 'Comptabilité / Audit' },
  { value: 'formateur', label: 'Formateur' }
]

const superAdminRoles = [
  { value: 'super_admin', label: 'Super admin' },
  ...roles
]

const rolesWithLogin = [
  'super_admin',
  'direction',
  'chef_division',
  'pompiste'
]

const roleLabels = {
  super_admin: 'Super admin',
  direction: 'Direction',
  chef_division: 'Chefs de division',
  chauffeur: 'Chauffeurs / bénéficiaires',
  pompiste: 'Pompistes',
  comptabilite: 'Comptabilité / Audit',
  formateur: 'Formateurs'
}

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

  const [activeRoleTab, setActiveRoleTab] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  const needsLogin = rolesWithLogin.includes(role)

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

  function handleRoleChange(value) {
    setRole(value)

    if (!rolesWithLogin.includes(value)) {
      setEmail('')
      setPassword('123456')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!fullName || !role) {
      setError('Nom complet et rôle obligatoires.')
      setLoading(false)
      return
    }

    if (rolesWithLogin.includes(role) && (!email || !password)) {
      setError('Email et mot de passe obligatoires pour ce rôle.')
      setLoading(false)
      return
    }

    if (isSuperAdmin && role !== 'super_admin' && !structureId) {
      setError('Choisis une structure pour cet utilisateur.')
      setLoading(false)
      return
    }

    const payload = {
      email: rolesWithLogin.includes(role) ? email : null,
      password: rolesWithLogin.includes(role) ? password : null,
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
    setActiveRoleTab('all')
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

  const tabs = [
    { value: 'all', label: 'Tous' },
    ...availableRoles
  ]

  const filteredUsers = users.filter((user) => {
    const text = search.toLowerCase()

    const matchesSearch =
      user.full_name?.toLowerCase().includes(text) ||
      user.email?.toLowerCase().includes(text) ||
      user.phone?.toLowerCase().includes(text) ||
      user.role?.toLowerCase().includes(text) ||
      user.division?.name?.toLowerCase().includes(text)

    const matchesRole =
      activeRoleTab === 'all' || user.role === activeRoleTab

    return matchesSearch && matchesRole
  })

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Sécurité & accès</p>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            Crée les comptes des responsables, chauffeurs, pompistes, formateurs et agents de contrôle.
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

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16
            }}
          >
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setActiveRoleTab(item.value)
                  setVisibleCount(10)
                }}
                className={
                  activeRoleTab === item.value
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
                style={{
                  padding: '8px 12px',
                  fontSize: 13
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="panel-subtitle">
            {activeRoleTab === 'all'
              ? 'Tous les comptes actifs de la plateforme.'
              : roleLabels[activeRoleTab] || 'Comptes actifs de la plateforme.'}
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredUsers
              .slice(0, visibleCount)
              .map((user) => (
                <EntityCard
                  key={user.id}
                  title={user.full_name}
                  subtitle={user.email || 'Aucun accès de connexion'}
                  badge="SUPPRIMER"
                  badgeTone="danger"
                  onAction={() => handleDelete(user.id)}
                  items={[
                    {
                      label: 'Rôle',
                      value: roleLabels[user.role] || user.role
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

            {filteredUsers.length > visibleCount && (
              <button
                className="btn-secondary"
                onClick={() => setVisibleCount(visibleCount + 10)}
              >
                Voir plus
              </button>
            )}

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

            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="form-input"
            >
              {availableRoles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {needsLogin && (
              <>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="form-input"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe temporaire"
                  className="form-input"
                />
              </>
            )}

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
              className="form-input"
            />

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