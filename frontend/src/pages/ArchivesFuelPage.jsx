import { useEffect, useState } from 'react'
import { ArchiveRestore, RefreshCw, Trash2 } from 'lucide-react'

import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'

import {
  getArchivedFuelDeliveries,
  restoreFuelDelivery,
  getArchivedDivisions,
  restoreDivision,
  deleteArchivedDivisionPermanently,
  getArchivedVehicles,
  restoreVehicle,
  deleteArchivedVehiclePermanently,
  getArchivedUsers,
  restoreUser,
  deleteArchivedUserPermanently
} from '../api/api'

const tabs = [
  { value: 'deliveries', label: 'Livraisons' },
  { value: 'divisions', label: 'Divisions' },
  { value: 'vehicles', label: 'Véhicules' },
  { value: 'users', label: 'Utilisateurs' }
]

export default function ArchivesFuelPage() {
  const [activeTab, setActiveTab] = useState('deliveries')

  const [deliveries, setDeliveries] = useState([])
  const [divisions, setDivisions] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [users, setUsers] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadArchives(tab = activeTab) {
    setLoading(true)
    setError('')

    let data

    if (tab === 'deliveries') {
      data = await getArchivedFuelDeliveries()
      if (data.error) setError(data.error)
      setDeliveries(data.deliveries || [])
    }

    if (tab === 'divisions') {
      data = await getArchivedDivisions()
      if (data.error) setError(data.error)
      setDivisions(data.divisions || [])
    }

    if (tab === 'vehicles') {
      data = await getArchivedVehicles()
      if (data.error) setError(data.error)
      setVehicles(data.vehicles || [])
    }

    if (tab === 'users') {
      data = await getArchivedUsers()
      if (data.error) setError(data.error)
      setUsers(data.users || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadArchives(activeTab)
  }, [activeTab])

  async function handleRestoreDelivery(item) {
    if (!window.confirm('Restaurer cette livraison ?')) return

    const data = await restoreFuelDelivery(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('deliveries')
  }

  async function handleRestoreDivision(item) {
    if (!window.confirm('Restaurer cette division ?')) return

    const data = await restoreDivision(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('divisions')
  }

  async function handleDeleteDivision(item) {
    if (!window.confirm(
      'Supprimer définitivement cette division ? Cette action sera refusée si elle est liée à un bon.'
    )) return

    const data = await deleteArchivedDivisionPermanently(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('divisions')
  }

  async function handleRestoreVehicle(item) {
    if (!window.confirm('Restaurer ce véhicule ?')) return

    const data = await restoreVehicle(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('vehicles')
  }

  async function handleDeleteVehicle(item) {
    if (!window.confirm(
      'Supprimer définitivement ce véhicule ? Cette action sera refusée s’il est lié à un bon.'
    )) return

    const data = await deleteArchivedVehiclePermanently(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('vehicles')
  }

  async function handleRestoreUser(item) {
    if (!window.confirm('Restaurer cet utilisateur ?')) return

    const data = await restoreUser(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('users')
  }

  async function handleDeleteUser(item) {
    if (!window.confirm(
      'Supprimer définitivement cet utilisateur ? Cette action sera refusée s’il est lié à un bon ou une livraison.'
    )) return

    const data = await deleteArchivedUserPermanently(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives('users')
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Audit & sécurité</p>
          <h1 className="page-title">Archives générales</h1>
          <p className="page-subtitle">
            Livraisons, divisions, véhicules et utilisateurs archivés.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={() => loadArchives(activeTab)}>
            <RefreshCw size={16} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={activeTab === tab.value ? 'btn-primary' : 'btn-secondary'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: '#fee2e2',
            color: '#b91c1c',
            marginBottom: 18,
            fontWeight: 700
          }}
        >
          {error}
        </div>
      )}

      <div className="panel">
        {activeTab === 'deliveries' && (
          <>
            <h3 className="panel-title">Livraisons archivées</h3>
            <p className="panel-subtitle">
              Ces livraisons sont conservées pour audit mais exclues des calculs actifs.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {deliveries.map((item) => (
                <div key={item.id} style={{ display: 'grid', gap: 8 }}>
                  <EntityCard
                    title={item.voucher?.voucher_number || 'Bon carburant'}
                    subtitle={
                      item.archived_at
                        ? `Archivé le ${new Date(item.archived_at).toLocaleString('fr-FR')}`
                        : 'Archive carburant'
                    }
                    badge="ARCHIVÉ"
                    badgeTone="danger"
                    items={[
                      {
                        label: 'Véhicule',
                        value: `${item.voucher?.vehicle?.plate_number || '-'} — ${item.voucher?.vehicle?.label || 'Sans libellé'}`
                      },
                      {
                        label: 'Division',
                        value: item.voucher?.division?.code
                          ? `${item.voucher.division.code} — ${item.voucher.division.name}`
                          : item.voucher?.division?.name || '-'
                      },
                      {
                        label: 'Litres',
                        value: `${item.delivered_liters || 0} L`
                      },
                      {
                        label: 'Kilométrage',
                        value: item.odometer_km ? `${item.odometer_km} km` : '-'
                      },
                      {
                        label: 'Pompiste',
                        value: item.pompiste?.full_name || '-'
                      },
                      {
                        label: 'Motif',
                        value: item.archive_reason || '-'
                      }
                    ]}
                  />

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleRestoreDelivery(item)}
                  >
                    <ArchiveRestore size={16} />
                    Restaurer cette livraison
                  </button>
                </div>
              ))}

              {deliveries.length === 0 && (
                <EntityCard
                  title="Aucune livraison archivée"
                  subtitle="Toutes les livraisons actives sont visibles dans les rapports."
                  badge="VIDE"
                  badgeTone="blue"
                  items={[{ label: 'Statut', value: 'Aucune livraison archivée' }]}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'divisions' && (
          <>
            <h3 className="panel-title">Divisions archivées</h3>
            <p className="panel-subtitle">
              Restaurer une division ou la supprimer définitivement si elle n’est liée à aucun bon.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {divisions.map((item) => (
                <div key={item.id} style={{ display: 'grid', gap: 8 }}>
                  <EntityCard
                    title={item.code || 'Division'}
                    subtitle={item.name}
                    badge="ARCHIVÉ"
                    badgeTone="danger"
                    items={[
                      { label: 'Code', value: item.code || '-' },
                      { label: 'Responsable', value: item.manager_name || '-' },
                      { label: 'Structure', value: item.structure?.name || '-' }
                    ]}
                  />

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleRestoreDivision(item)}
                  >
                    <ArchiveRestore size={16} />
                    Restaurer cette division
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDeleteDivision(item)}
                  >
                    <Trash2 size={16} />
                    Supprimer définitivement
                  </button>
                </div>
              ))}

              {divisions.length === 0 && (
                <EntityCard
                  title="Aucune division archivée"
                  subtitle="Les divisions actives restent dans la page Divisions."
                  badge="VIDE"
                  badgeTone="blue"
                  items={[{ label: 'Statut', value: 'Aucune division archivée' }]}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'vehicles' && (
          <>
            <h3 className="panel-title">Véhicules archivés</h3>
            <p className="panel-subtitle">
              Restaurer un véhicule ou le supprimer définitivement s’il n’est lié à aucun bon.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {vehicles.map((item) => (
                <div key={item.id} style={{ display: 'grid', gap: 8 }}>
                  <EntityCard
                    title={item.plate_number || 'Véhicule'}
                    subtitle={item.label || 'Véhicule archivé'}
                    badge="ARCHIVÉ"
                    badgeTone="danger"
                    items={[
                      { label: 'Catégorie', value: item.vehicle_type || '-' },
                      { label: 'Carburant', value: item.fuel_type || '-' },
                      {
                        label: 'Division',
                        value: item.division?.code
                          ? `${item.division.code} — ${item.division.name}`
                          : item.division?.name || '-'
                      },
                      { label: 'Structure', value: item.structure?.name || '-' }
                    ]}
                  />

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleRestoreVehicle(item)}
                  >
                    <ArchiveRestore size={16} />
                    Restaurer ce véhicule
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDeleteVehicle(item)}
                  >
                    <Trash2 size={16} />
                    Supprimer définitivement
                  </button>
                </div>
              ))}

              {vehicles.length === 0 && (
                <EntityCard
                  title="Aucun véhicule archivé"
                  subtitle="Les véhicules actifs restent dans la page Véhicules."
                  badge="VIDE"
                  badgeTone="blue"
                  items={[{ label: 'Statut', value: 'Aucun véhicule archivé' }]}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h3 className="panel-title">Utilisateurs archivés</h3>
            <p className="panel-subtitle">
              Restaurer un utilisateur ou le supprimer définitivement s’il n’est lié à aucun historique.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {users.map((item) => (
                <div key={item.id} style={{ display: 'grid', gap: 8 }}>
                  <EntityCard
                    title={item.full_name || 'Utilisateur'}
                    subtitle={
                      item.email?.includes('@fuel.local')
                        ? 'Aucun accès de connexion'
                        : item.email || 'Aucun accès de connexion'
                    }
                    badge="ARCHIVÉ"
                    badgeTone="danger"
                    items={[
                      { label: 'Rôle', value: item.role || '-' },
                      { label: 'Téléphone', value: item.phone || '-' },
                      { label: 'Division', value: item.division?.name || '-' },
                      { label: 'Structure', value: item.structure?.name || '-' }
                    ]}
                  />

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleRestoreUser(item)}
                  >
                    <ArchiveRestore size={16} />
                    Restaurer cet utilisateur
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDeleteUser(item)}
                  >
                    <Trash2 size={16} />
                    Supprimer définitivement
                  </button>
                </div>
              ))}

              {users.length === 0 && (
                <EntityCard
                  title="Aucun utilisateur archivé"
                  subtitle="Les utilisateurs actifs restent dans la page Utilisateurs."
                  badge="VIDE"
                  badgeTone="blue"
                  items={[{ label: 'Statut', value: 'Aucun utilisateur archivé' }]}
                />
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}