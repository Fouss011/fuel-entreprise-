import { useEffect, useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileText, Fuel, Gauge } from 'lucide-react'

import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/StatCard'
import EntityCard from '../components/EntityCard'
import {
  archiveFuelDelivery,
  getDeliveriesReport,
  updateFuelDelivery
} from '../api/api'

export default function ReportsPage() {
  const editRef = useRef(null)

  const [deliveries, setDeliveries] = useState([])
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')

  const [editingDelivery, setEditingDelivery] = useState(null)
  const [deliveredLiters, setDeliveredLiters] = useState('')
  const [odometerKm, setOdometerKm] = useState('')
  const [stationName, setStationName] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    const data = await getDeliveriesReport()
    setDeliveries(data.deliveries || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  function startEdit(item) {
    setEditingDelivery(item)
    setDeliveredLiters(item.delivered_liters || '')
    setOdometerKm(item.odometer_km || '')
    setStationName(item.station_name || '')
    setDeliveryNotes(item.delivery_notes || '')
    setError('')

    setTimeout(() => {
      editRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  function cancelEdit() {
    setEditingDelivery(null)
    setDeliveredLiters('')
    setOdometerKm('')
    setStationName('')
    setDeliveryNotes('')
    setError('')
  }

  async function handleUpdateDelivery(e) {
    e.preventDefault()

    if (!editingDelivery) return

    setSaving(true)
    setError('')

    const data = await updateFuelDelivery(editingDelivery.id, {
      deliveredLiters,
      odometerKm,
      stationName,
      deliveryNotes
    })

    if (data.error) {
      setError(data.error)
      setSaving(false)
      return
    }

    cancelEdit()
    await loadData()
    setSaving(false)
  }

  async function handleArchiveDelivery(item) {
    const reason = window.prompt(
      `Motif d'archivage du bon ${item.voucher?.voucher_number || ''} :`
    )

    if (!reason || !reason.trim()) return

    const data = await archiveFuelDelivery(item.id, { reason })

    if (data.error) {
      setError(data.error)
      return
    }

    if (editingDelivery?.id === item.id) {
      cancelEdit()
    }

    await loadData()
  }

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      const q = search.toLowerCase().trim()

      const status = item.status || 'active'
      const plate = item.voucher?.vehicle?.plate_number?.toLowerCase() || ''
      const vehicleLabel = item.voucher?.vehicle?.label?.toLowerCase() || ''
      const voucherNumber = item.voucher?.voucher_number?.toLowerCase() || ''
      const divisionName = item.voucher?.division?.name?.toLowerCase() || ''
      const divisionCode = item.voucher?.division?.code?.toLowerCase() || ''
      const pompiste = item.pompiste?.full_name?.toLowerCase() || ''

      const matchesSearch =
        !q ||
        plate.includes(q) ||
        vehicleLabel.includes(q) ||
        voucherNumber.includes(q) ||
        divisionName.includes(q) ||
        divisionCode.includes(q) ||
        pompiste.includes(q)

      const deliveryMonth = item.delivered_at?.slice(0, 7)
      const matchesMonth = !month || deliveryMonth === month

      return status !== 'archived' && matchesSearch && matchesMonth
    })
  }, [deliveries, search, month])

  const stats = useMemo(() => {
    return {
      totalDeliveries: filteredDeliveries.length,
      totalLiters: filteredDeliveries.reduce(
        (sum, item) => sum + Number(item.delivered_liters || 0),
        0
      ),
      lastOdometer: filteredDeliveries.reduce((max, item) => {
        const km = Number(item.odometer_km || 0)
        return km > max ? km : max
      }, 0)
    }
  }, [filteredDeliveries])

  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Rapport carburant', 14, 18)

    doc.setFontSize(10)
    doc.text(`Période : ${month || 'Toutes périodes'}`, 14, 28)
    doc.text(`Recherche : ${search || 'Aucune'}`, 14, 34)

    doc.setFontSize(12)
    doc.text(`Nombre de livraisons : ${stats.totalDeliveries}`, 14, 46)
    doc.text(`Litres servis : ${stats.totalLiters} L`, 14, 53)
    doc.text(`Kilométrage max relevé : ${stats.lastOdometer || 0} km`, 14, 60)

    autoTable(doc, {
      startY: 70,
      head: [[
        'Bon',
        'Plaque',
        'Division',
        'Litres',
        'Kilométrage',
        'Station',
        'Pompiste',
        'Date'
      ]],
      body: filteredDeliveries.map((item) => [
        item.voucher?.voucher_number || '-',
        item.voucher?.vehicle?.plate_number || '-',
        item.voucher?.division?.code
          ? `${item.voucher.division.code} - ${item.voucher.division.name}`
          : item.voucher?.division?.name || '-',
        `${item.delivered_liters || 0} L`,
        item.odometer_km ? `${item.odometer_km} km` : '-',
        item.station_name || '-',
        item.pompiste?.full_name || '-',
        item.delivered_at
          ? new Date(item.delivered_at).toLocaleDateString('fr-FR')
          : '-'
      ])
    })

    doc.save(`rapport-carburant-${month || 'global'}.pdf`)
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Reporting & audit</p>
          <h1 className="page-title">Rapports carburant</h1>
          <p className="page-subtitle">
            Recherche par plaque, numéro de bon, division, pompiste ou période mensuelle.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-primary" onClick={exportPDF}>
            Exporter PDF
          </button>
        </div>
      </div>

      {editingDelivery && (
        <div className="panel" ref={editRef} style={{ marginBottom: 22 }}>
          <h3 className="panel-title">Modifier une livraison servie</h3>
          <p className="panel-subtitle">
            Bon : {editingDelivery.voucher?.voucher_number || '-'} — Véhicule : {editingDelivery.voucher?.vehicle?.plate_number || '-'}
          </p>

          <form onSubmit={handleUpdateDelivery} style={{ display: 'grid', gap: 14 }}>
            <input
              value={deliveredLiters}
              onChange={(e) => setDeliveredLiters(e.target.value)}
              placeholder="Litres servis"
              className="form-input"
              type="number"
            />

            <input
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
              placeholder="Kilométrage compteur"
              className="form-input"
              type="number"
            />

            <input
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="Station / pompe"
              className="form-input"
            />

            <input
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Observation"
              className="form-input"
            />

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

            <button className="btn-primary" disabled={saving}>
              {saving ? 'Modification...' : 'Mettre à jour la livraison'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={cancelEdit}
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      <div className="panel" style={{ marginBottom: 22 }}>
        <h3 className="panel-title">Filtres de recherche</h3>
        <p className="panel-subtitle">
          Filtre les consommations et les kilométrages relevés.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 14
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher : plaque, bon, division, pompiste..."
            className="form-input"
          />

          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            type="month"
            className="form-input"
          />
        </div>
      </div>

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))' }}
      >
        <StatCard
          title="Livraisons"
          value={stats.totalDeliveries}
          subtitle="Selon le filtre actuel"
          icon={<FileText size={21} />}
          tone="blue"
        />

        <StatCard
          title="Litres servis"
          value={stats.totalLiters}
          subtitle="Volume filtré"
          icon={<Fuel size={21} />}
          tone="green"
        />

        <StatCard
          title="Kilométrage max"
          value={`${stats.lastOdometer || 0} km`}
          subtitle="Dernier relevé le plus élevé"
          icon={<Gauge size={21} />}
          tone="amber"
        />
      </section>

      <div className="panel">
        <h3 className="panel-title">Historique filtré</h3>
        <p className="panel-subtitle">
          {filteredDeliveries.length} résultat(s) trouvé(s).
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {filteredDeliveries.map((item) => (
            <div key={item.id} style={{ display: 'grid', gap: 8 }}>
              <EntityCard
                title={item.voucher?.voucher_number || 'Bon carburant'}
                subtitle={item.delivered_at
                  ? new Date(item.delivered_at).toLocaleString('fr-FR')
                  : 'Date non renseignée'
                }
                badge="MODIFIER"
                badgeTone="blue"
                onAction={() => startEdit(item)}
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
                    label: 'Station',
                    value: item.station_name || '-'
                  },
                  {
                    label: 'Pompiste',
                    value: item.pompiste?.full_name || '-'
                  }
                ]}
              />

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleArchiveDelivery(item)}
              >
                Archiver cette livraison
              </button>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <EntityCard
              title="Aucun résultat trouvé"
              subtitle="Rapport carburant"
              badge="VIDE"
              badgeTone="blue"
              items={[
                {
                  label: 'Recherche',
                  value: search || 'Aucune'
                },
                {
                  label: 'Période',
                  value: month || 'Toutes périodes'
                }
              ]}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}