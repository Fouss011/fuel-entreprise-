import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import { createStructure, getStructures } from '../api/api'

export default function StructuresPage() {
  const [structures, setStructures] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadStructures() {
    const data = await getStructures()

    if (data.error) {
      setError(data.error)
      return
    }

    setStructures(data.structures || [])
  }

  useEffect(() => {
    loadStructures()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await createStructure({
      name,
      code
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setName('')
    setCode('')
    await loadStructures()
    setLoading(false)
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Multi-structures</p>
          <h1 className="page-title">Structures clientes</h1>
          <p className="page-subtitle">
            Crée et administre les sociétés qui utilisent Fuel Manager.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des structures</h3>
          <p className="panel-subtitle">
            Chaque structure possède son propre espace de gestion.
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {structures.map((structure) => (
              <EntityCard
                key={structure.id}
                title={structure.name}
                subtitle={`Code : ${structure.code}`}
                badge={structure.is_active ? 'ACTIVE' : 'INACTIVE'}
                items={[
                  {
                    label: 'Identifiant',
                    value: structure.id
                  },
                  {
                    label: 'Créée le',
                    value: structure.created_at
                      ? new Date(structure.created_at).toLocaleDateString()
                      : '-'
                  }
                ]}
              />
            ))}

            {structures.length === 0 && (
              <p style={{ color: '#94a3b8' }}>
                Aucune structure enregistrée.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Créer une structure</h3>
          <p className="panel-subtitle">
            Exemple : SNPT, CIMTOGO, Port Autonome, etc.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la structure"
              className="form-input"
            />

            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Code structure : SNPT"
              className="form-input"
            />

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

            <button disabled={loading} className="btn-primary">
              {loading ? 'Création...' : 'Créer la structure'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}