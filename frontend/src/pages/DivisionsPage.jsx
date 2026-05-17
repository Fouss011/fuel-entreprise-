import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { createDivision, deleteDivision, getDivisions } from '../api/api'
import EntityCard from '../components/EntityCard'

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [managerName, setManagerName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  async function loadDivisions() {
    const data = await getDivisions()
    setDivisions(data.divisions || [])
  }

  useEffect(() => {
    loadDivisions()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await createDivision({
      name,
      code,
      managerName
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setName('')
    setCode('')
    setManagerName('')
    await loadDivisions()
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette division ?')) return

    const data = await deleteDivision(id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadDivisions()
  }

  const filteredDivisions = divisions.filter((division) => {
  const text = search.toLowerCase()

  return (
    division.name?.toLowerCase().includes(text) ||
    division.code?.toLowerCase().includes(text) ||
    division.manager_name?.toLowerCase().includes(text)
  )
})

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Organisation</p>
          <h1 className="page-title">Divisions & services</h1>
          <p className="page-subtitle">
            Crée les divisions, directions ou services qui utiliseront les bons carburant.
          </p>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ marginBottom: 18, color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des divisions</h3>
          <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Rechercher division, code, responsable..."
  className="form-input"
  style={{
    marginTop: 14,
    marginBottom: 16
  }}
/>
          <p className="panel-subtitle">Toutes les entités enregistrées.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredDivisions
  .slice(0, visibleCount)
  .map((division) => (
  <EntityCard
    key={division.id}
    title={division.name}
    subtitle="Division / service"
    badge="SUPPRIMER"
    badgeTone="danger"
    onAction={() => handleDelete(division.id)}
    items={[
      {
        label: 'Code',
        value: division.code
      },
      {
        label: 'Responsable',
        value: division.manager_name || '-'
      }
    ]}
  />
))}

{filteredDivisions.length > visibleCount && (
  <button
    className="btn-secondary"
    onClick={() => setVisibleCount(visibleCount + 10)}
  >
    Voir plus
  </button>
)}

            {filteredDivisions.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucune division enregistrée.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Créer une division</h3>
          <p className="panel-subtitle">
            Exemple : Direction Mines, Logistique, Maintenance.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la division"
              className="form-input"
            />

            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code court ex: MINE"
              className="form-input"
            />

            <input
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Responsable"
              className="form-input"
            />

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer la division'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}