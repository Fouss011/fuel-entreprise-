import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import { createStructure, getStructures } from '../api/api'

export default function StructuresPage() {
  const currentUser = JSON.parse(localStorage.getItem('fuel_user') || '{}')
  const isSuperAdmin = currentUser.role === 'super_admin'

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
    if (!isSuperAdmin) {
      window.location.replace('/')
      return
    }

    loadStructures()
  }, [])

  function enterStructure(structure) {
    localStorage.setItem('active_structure_id', structure.id)
    localStorage.setItem('active_structure_name', structure.name)
    window.location.href = '/'
  }

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

  if (!isSuperAdmin) {
    return null
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Multi-structures</p>
          <h1 className="page-title">Structures clientes</h1>
          <p className="page-subtitle">
            Choisis une structure pour entrer dans son espace ou crée une nouvelle société cliente.
          </p>
        </div>
      </div>

      <div
        className="panel"
        style={{
          marginBottom: 20,
          border: '1px solid #bfdbfe',
          background: '#eff6ff'
        }}
      >
        <h3 className="panel-title">Espace super admin</h3>
        <p className="panel-subtitle">
          Aucune structure n’est sélectionnée par défaut. Clique sur “Entrer dans cet espace”
          pour travailler uniquement sur les données de la structure choisie.
        </p>
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
                badgeTone={structure.is_active ? 'green' : 'danger'}
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
                  },
                  {
                    label: 'Action',
                    value: (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => enterStructure(structure)}
                        style={{
                          padding: '7px 10px',
                          fontSize: 12
                        }}
                      >
                        ENTRER DANS CET ESPACE
                      </button>
                    )
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