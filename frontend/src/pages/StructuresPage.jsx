import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import { createStructure, getStructures, updateStructure } from '../api/api'

export default function StructuresPage() {
  const currentUser = JSON.parse(localStorage.getItem('fuel_user') || '{}')
  const isSuperAdmin = currentUser.role === 'super_admin'

  const [structures, setStructures] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [editingStructure, setEditingStructure] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [error, setError] = useState('')
  const [editError, setEditError] = useState('')
  const [loading, setLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

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

  function startEdit(structure) {
    setEditingStructure(structure)
    setEditName(structure.name || '')
    setEditCode(structure.code || '')
    setEditIsActive(Boolean(structure.is_active))
    setEditError('')
  }

  function cancelEdit() {
    setEditingStructure(null)
    setEditName('')
    setEditCode('')
    setEditIsActive(true)
    setEditError('')
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

  async function handleUpdate(e) {
    e.preventDefault()

    if (!editingStructure) {
      return
    }

    setEditLoading(true)
    setEditError('')

    const data = await updateStructure(editingStructure.id, {
      name: editName,
      code: editCode,
      isActive: editIsActive
    })

    if (data.error) {
      setEditError(data.error)
      setEditLoading(false)
      return
    }

    const updatedStructure = data.structure

    if (
      updatedStructure &&
      localStorage.getItem('active_structure_id') === updatedStructure.id
    ) {
      localStorage.setItem('active_structure_name', updatedStructure.name)
    }

    cancelEdit()
    await loadStructures()
    setEditLoading(false)
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
            Choisis une structure pour entrer dans son espace, crée une nouvelle société cliente
            ou modifie ses informations.
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
          Cette page est réservée au super admin. Les administrateurs des structures ne voient pas
          cette interface. Ils sont automatiquement rattachés à leur propre structure.
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
                    label: 'Actions',
                    value: (
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap'
                        }}
                      >
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => enterStructure(structure)}
                          style={{
                            padding: '7px 10px',
                            fontSize: 12
                          }}
                        >
                          ENTRER
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => startEdit(structure)}
                          style={{
                            padding: '7px 10px',
                            fontSize: 12
                          }}
                        >
                          MODIFIER
                        </button>
                      </div>
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
          {editingStructure ? (
            <>
              <h3 className="panel-title">Modifier une structure</h3>
              <p className="panel-subtitle">
                Les utilisateurs et les données restent liés à l’identifiant interne de la structure.
                Modifier le nom ou le code ne casse donc pas l’historique.
              </p>

              <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 14 }}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nom de la structure"
                  className="form-input"
                />

                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  placeholder="Code structure : SNPT"
                  className="form-input"
                />

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#07172f',
                    fontSize: 14,
                    fontWeight: 800
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  Structure active
                </label>

                {editError && (
                  <p style={{ color: '#b91c1c' }}>{editError}</p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap'
                  }}
                >
                  <button disabled={editLoading} className="btn-primary">
                    {editLoading ? 'Modification...' : 'Enregistrer les modifications'}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelEdit}
                    disabled={editLoading}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}