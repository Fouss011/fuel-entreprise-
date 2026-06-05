import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FileText, Fuel, Gauge } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/StatCard'
import EntityCard from '../components/EntityCard'
import SearchSelect from '../components/SearchSelect'

import { getVehicleHistory, getVehicles } from '../api/api'

export default function VehicleHistoryPage() {
  const exportRef = useRef(null)

  const [deliveries, setDeliveries] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vehicleId, setVehicleId] = useState('')
  const [month, setMonth] = useState('')
  const [exporting, setExporting] = useState(false)

  async function loadVehicles() {
    const vehiclesData = await getVehicles()
    setVehicles(vehiclesData.vehicles || [])

    if (!vehicleId && vehiclesData.vehicles?.[0]) {
      setVehicleId(vehiclesData.vehicles[0].id)
    }
  }

  async function loadHistory(id = vehicleId, selectedMonth = month) {
    if (!id) return
    const historyData = await getVehicleHistory(id, selectedMonth)
    setDeliveries(historyData.deliveries || [])
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    if (vehicleId) {
      loadHistory(vehicleId, month)
    }
  }, [vehicleId, month])

  const filteredDeliveries = useMemo(() => {
    return [...deliveries].sort((a, b) => {
      const dateA = new Date(a.delivered_at || a.created_at || 0).getTime()
      const dateB = new Date(b.delivered_at || b.created_at || 0).getTime()
      return dateA - dateB
    })
  }, [deliveries])

  const enrichedDeliveries = useMemo(() => {
    return filteredDeliveries.map((item, index) => {
      const previous = filteredDeliveries[index - 1]
      const currentKm = Number(item.odometer_km || 0)
      const previousKm = Number(previous?.odometer_km || 0)

      const distanceKm =
        previous && currentKm > previousKm
          ? currentKm - previousKm
          : 0

      return {
        ...item,
        distanceKm
      }
    })
  }, [filteredDeliveries])

  const stats = useMemo(() => {
    return {
      totalDeliveries: enrichedDeliveries.length,
      totalLiters: enrichedDeliveries.reduce(
        (sum, item) => sum + Number(item.delivered_liters || 0),
        0
      ),
      lastOdometer: enrichedDeliveries.reduce((max, item) => {
        const km = Number(item.odometer_km || 0)
        return km > max ? km : max
      }, 0),
      totalDistance: enrichedDeliveries.reduce(
        (sum, item) => sum + Number(item.distanceKm || 0),
        0
      )
    }
  }, [enrichedDeliveries])

  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Historique véhicule', 14, 18)

    doc.setFontSize(10)
    doc.text(`Période : ${month || 'Toutes périodes'}`, 14, 28)

    const selectedVehicle = vehicles.find((item) => item.id === vehicleId)

    doc.text(
      `Véhicule : ${selectedVehicle?.plate_number || 'Non sélectionné'}`,
      14,
      34
    )

    doc.setFontSize(12)
    doc.text(`Nombre de livraisons : ${stats.totalDeliveries}`, 14, 46)
    doc.text(`Litres servis : ${stats.totalLiters} L`, 14, 53)
    doc.text(`Dernier kilométrage : ${stats.lastOdometer || 0} km`, 14, 60)
    doc.text(`Distance estimée : ${stats.totalDistance || 0} km`, 14, 67)

    autoTable(doc, {
      startY: 78,
      head: [[
        'Bon',
        'Plaque',
        'Division',
        'Demandé',
        'Approuvé',
        'Servi',
        'Kilométrage',
        'Distance',
        'Date'
      ]],
      body: enrichedDeliveries.map((item) => [
        item.voucher?.voucher_number || '-',
        item.voucher?.vehicle?.plate_number || '-',
        item.voucher?.division?.code
          ? `${item.voucher.division.code} - ${item.voucher.division.name}`
          : item.voucher?.division?.name || '-',
        `${item.voucher?.requested_liters || 0} L`,
        `${item.voucher?.approved_liters || 0} L`,
        `${item.delivered_liters || 0} L`,
        item.odometer_km ? `${item.odometer_km} km` : '-',
        item.distanceKm ? `${item.distanceKm} km` : '-',
        item.delivered_at
          ? new Date(item.delivered_at).toLocaleDateString('fr-FR')
          : '-'
      ])
    })

    doc.save(`historique-vehicule-${month || 'global'}.pdf`)
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Historique flotte</p>
          <h1 className="page-title">Historique véhicule</h1>
          <p className="page-subtitle">
            Suivi détaillé des litres servis, du kilométrage et des distances estimées.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-primary" onClick={exportPDF} disabled={exporting}>
            <Download size={16} />
            {exporting ? 'Export...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      <div ref={exportRef}>
        <div className="panel" style={{ marginBottom: 22 }}>
          <h3 className="panel-title">Recherche véhicule</h3>
          <p className="panel-subtitle">Recherche par plaque, nom ou division.</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 14
            }}
          >
            <SearchSelect
              placeholder="Rechercher un véhicule..."
              items={vehicles}
              value={vehicleId}
              onChange={setVehicleId}
              getLabel={(item) => item.plate_number}
              getSubLabel={(item) =>
                `${item.label || 'Véhicule'} — ${
                  item.division?.code
                    ? `${item.division.code} / ${item.division.name}`
                    : item.division?.name || '-'
                }`
              }
            />

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <section
          className="dashboard-grid"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))'
          }}
        >
          <StatCard
            title="Livraisons"
            value={stats.totalDeliveries}
            subtitle="Nombre d’opérations"
            icon={<FileText size={21} />}
            tone="blue"
          />

          <StatCard
            title="Litres"
            value={stats.totalLiters}
            subtitle="Carburant servi"
            icon={<Fuel size={21} />}
            tone="green"
          />

          <StatCard
            title="Kilométrage"
            value={`${stats.lastOdometer || 0} km`}
            subtitle="Dernier relevé"
            icon={<Gauge size={21} />}
            tone="amber"
          />

          <StatCard
            title="Distance"
            value={`${stats.totalDistance || 0} km`}
            subtitle="Distance estimée"
            icon={<Gauge size={21} />}
            tone="blue"
          />
        </section>

        <div className="panel" style={{ marginBottom: 22 }}>
          <h3 className="panel-title">Lecture rapide litres / distance</h3>
          <p className="panel-subtitle">
            Barres comparatives simples pour repérer rapidement les écarts.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {enrichedDeliveries.map((item) => {
              const liters = Number(item.delivered_liters || 0)
              const distance = Number(item.distanceKm || 0)
              const maxValue = Math.max(liters, distance, 1)

              return (
                <div
                  key={`chart-${item.id}`}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff'
                  }}
                >
                  <strong style={{ color: '#07172f' }}>
                    {item.voucher?.voucher_number || 'Bon carburant'}
                  </strong>

                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    {item.delivered_at
                      ? new Date(item.delivered_at).toLocaleDateString('fr-FR')
                      : 'Date non renseignée'}
                  </p>

                  <BarRow
                    label={`Litres servis : ${liters} L`}
                    value={liters}
                    maxValue={maxValue}
                  />

                  <BarRow
                    label={`Distance estimée : ${distance} km`}
                    value={distance}
                    maxValue={maxValue}
                  />
                </div>
              )
            })}

            {enrichedDeliveries.length === 0 && (
              <p style={{ color: '#94a3b8' }}>
                Aucun graphique disponible pour ce véhicule.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Détail des livraisons</h3>
          <p className="panel-subtitle">
            Bons, dates, pompistes, litres et kilométrages relevés.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {enrichedDeliveries.map((item) => (
              <EntityCard
                key={item.id}
                title={item.voucher?.voucher_number || 'Bon carburant'}
                subtitle={
                  item.delivered_at
                    ? new Date(item.delivered_at).toLocaleString('fr-FR')
                    : 'Date inconnue'
                }
                badge="SERVI"
                badgeTone="success"
                items={[
                  {
                    label: 'Véhicule',
                    value: item.voucher?.vehicle?.plate_number || '-'
                  },
                  {
                    label: 'Division',
                    value: item.voucher?.division?.code
                      ? `${item.voucher.division.code} — ${item.voucher.division.name}`
                      : item.voucher?.division?.name || '-'
                  },
                  {
                    label: 'Demandé',
                    value: `${item.voucher?.requested_liters || 0} L`
                  },
                  {
                    label: 'Approuvé',
                    value: `${item.voucher?.approved_liters || 0} L`
                  },
                  {
                    label: 'Servi',
                    value: `${item.delivered_liters || 0} L`
                  },
                  {
                    label: 'Kilométrage',
                    value: item.odometer_km ? `${item.odometer_km} km` : '-'
                  },
                  {
                    label: 'Distance estimée',
                    value: item.distanceKm ? `${item.distanceKm} km` : '-'
                  },
                  {
                    label: 'Pompiste',
                    value: item.pompiste?.full_name || '-'
                  }
                ]}
              />
            ))}

            {enrichedDeliveries.length === 0 && (
              <EntityCard
                title="Aucune livraison"
                subtitle="Historique véhicule"
                badge="VIDE"
                badgeTone="blue"
                items={[
                  {
                    label: 'Période',
                    value: month || 'Toutes périodes'
                  }
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function BarRow({ label, value, maxValue }) {
  const width = Math.max(4, Math.round((Number(value || 0) / maxValue) * 100))

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          color: '#334155',
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 6
        }}
      >
        <span>{label}</span>
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 999,
          background: '#e2e8f0',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            borderRadius: 999,
            background: '#1d4ed8'
          }}
        />
      </div>
    </div>
  )
}