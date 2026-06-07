import { useEffect, useState } from 'react'
import { ArchiveRestore, RefreshCw } from 'lucide-react'

import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'

import {
  getArchivedFuelDeliveries,
  restoreFuelDelivery
} from '../api/api'

export default function ArchivesFuelPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadArchives() {
    setLoading(true)
    setError('')

    const data = await getArchivedFuelDeliveries()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setDeliveries(data.deliveries || [])
    setLoading(false)
  }

  useEffect(() => {
    loadArchives()
  }, [])

  async function handleRestore(item) {
    if (!window.confirm('Restaurer cette livraison ?')) return

    const data = await restoreFuelDelivery(item.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadArchives()
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Audit & sécurité</p>
          <h1 className="page-title">Archives carburant</h1>
          <p className="page-subtitle">
            Livraisons archivées, exclues des rapports, statistiques et clôtures.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={loadArchives}>
            <RefreshCw size={16} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
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
        <h3 className="panel-title">Livraisons archivées</h3>
        <p className="panel-subtitle">
          Ces données sont conservées pour audit mais ne faussent plus les calculs.
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
                    label: 'Archivé par',
                    value: item.archived_by ? 'Utilisateur autorisé' : '-'
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
                onClick={() => handleRestore(item)}
              >
                <ArchiveRestore size={16} />
                Restaurer cette livraison
              </button>
            </div>
          ))}

          {deliveries.length === 0 && (
            <EntityCard
              title="Aucune archive"
              subtitle="Toutes les livraisons actives sont visibles dans les rapports."
              badge="VIDE"
              badgeTone="blue"
              items={[
                {
                  label: 'Statut',
                  value: 'Aucune livraison archivée'
                }
              ]}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}