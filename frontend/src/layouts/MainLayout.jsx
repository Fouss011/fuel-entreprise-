import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getStructures } from '../api/api'

export default function MainLayout({ children }) {
  const currentUser = JSON.parse(localStorage.getItem('fuel_user') || '{}')
  const isSuperAdmin = currentUser.role === 'super_admin'

  const [structures, setStructures] = useState([])
  const [activeStructureId, setActiveStructureId] = useState(
    localStorage.getItem('active_structure_id') || ''
  )

  async function loadStructures() {
    if (!isSuperAdmin) return

    const data = await getStructures()
    const loadedStructures = data.structures || []

    setStructures(loadedStructures)

  }

  useEffect(() => {
    loadStructures()
  }, [])

  function handleStructureChange(e) {
    const value = e.target.value

    localStorage.setItem('active_structure_id', value)
    setActiveStructureId(value)

    window.location.reload()
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        {isSuperAdmin && (
          <div
            className="panel"
            style={{
              marginBottom: 18,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <p className="page-eyebrow">Espace actif</p>
              <strong>
                Structure sélectionnée :{' '}
                {structures.find((s) => s.id === activeStructureId)?.name ||
                  'Aucune'}
              </strong>
            </div>

            <select
              value={activeStructureId}
              onChange={handleStructureChange}
              className="form-input"
              style={{ maxWidth: 320 }}
            >
              <option value="">Toutes les structures</option>
              {structures.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.name} ({structure.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}