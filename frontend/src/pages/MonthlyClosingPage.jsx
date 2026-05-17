import { useEffect, useRef, useState } from 'react'

import {
  CalendarDays,
  Download,
  FileText,
  Fuel,
  Wallet
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/StatCard'
import EntityCard from '../components/EntityCard'

import { getMonthlyClosing } from '../api/api'

export default function MonthlyClosingPage() {
  

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  const [summary, setSummary] = useState({
    totalDeliveries: 0,
    totalLiters: 0,
    totalAmount: 0
  })

  const [vehicles, setVehicles] = useState([])
  const [divisions, setDivisions] = useState([])

  const [visibleVehicles, setVisibleVehicles] = useState(10)
  const [visibleDivisions, setVisibleDivisions] = useState(10)
  const [exporting, setExporting] = useState(false)

  async function loadData(selectedMonth = month) {
    const data = await getMonthlyClosing(selectedMonth)

    setSummary(
      data.summary || {
        totalDeliveries: 0,
        totalLiters: 0,
        totalAmount: 0
      }
    )

    setVehicles(data.byVehicle || [])
    setDivisions(data.byDivision || [])

    setVisibleVehicles(10)
    setVisibleDivisions(10)
  }

  function exportPDF() {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Clôture mensuelle carburant', 14, 18)

  doc.setFontSize(10)
  doc.text(`Période : ${month}`, 14, 28)

  doc.setFontSize(12)
  doc.text(`Nombre de livraisons : ${summary.totalDeliveries}`, 14, 42)
  doc.text(`Litres servis : ${summary.totalLiters} L`, 14, 49)
  doc.text(`Montant total : ${summary.totalAmount} FCFA`, 14, 56)

  autoTable(doc, {
    startY: 68,
    head: [[
      'Véhicule',
      'Libellé',
      'Litres',
      'Montant',
      'Livraisons'
    ]],
    body: vehicles.map((vehicle) => [
      vehicle.plateNumber || '-',
      vehicle.label || '-',
      `${vehicle.totalLiters || 0} L`,
      `${vehicle.totalAmount || 0} FCFA`,
      vehicle.deliveries || 0
    ])
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [[
      'Division',
      'Code',
      'Litres',
      'Montant',
      'Livraisons'
    ]],
    body: divisions.map((division) => [
      division.name || '-',
      division.code || '-',
      `${division.totalLiters || 0} L`,
      `${division.totalAmount || 0} FCFA`,
      division.deliveries || 0
    ])
  })

  doc.save(`cloture-mensuelle-${month}.pdf`)
}

  useEffect(() => {
    loadData(month)
  }, [month])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Audit mensuel</p>
          <h1 className="page-title">Clôture mensuelle</h1>
          <p className="page-subtitle">
            Consolidation des consommations carburant par véhicule et division.
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
          <h3 className="panel-title">Période d’analyse</h3>

          <div style={{ marginTop: 14, maxWidth: 320 }}>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <section className="dashboard-grid">
          <StatCard
            title="Mois"
            value={month}
            subtitle="Période analysée"
            icon={<CalendarDays size={21} />}
            tone="blue"
          />

          <StatCard
            title="Livraisons"
            value={summary.totalDeliveries}
            subtitle="Opérations confirmées"
            icon={<FileText size={21} />}
            tone="blue"
          />

          <StatCard
            title="Litres"
            value={summary.totalLiters}
            subtitle="Volume total"
            icon={<Fuel size={21} />}
            tone="green"
          />

          <StatCard
            title="Montant"
            value={`${summary.totalAmount} FCFA`}
            subtitle="Coût mensuel"
            icon={<Wallet size={21} />}
            tone="amber"
          />
        </section>

        <div className="panel-grid">
          <div className="panel">
            <h3 className="panel-title">Consommation par véhicule</h3>
            <p className="panel-subtitle">
              Classement mensuel de la flotte.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {vehicles
                .slice(0, visibleVehicles)
                .map((vehicle) => (
                  <EntityCard
                    key={vehicle.id}
                    title={vehicle.plateNumber}
                    subtitle={vehicle.label || 'Véhicule'}
                    badge="FLOTTE"
                    badgeTone="blue"
                    items={[
                      {
                        label: 'Litres',
                        value: `${vehicle.totalLiters} L`
                      },
                      {
                        label: 'Montant',
                        value: `${vehicle.totalAmount} FCFA`
                      },
                      {
                        label: 'Livraisons',
                        value: vehicle.deliveries
                      }
                    ]}
                  />
                ))}

              {vehicles.length > visibleVehicles && (
                <button
                  className="btn-secondary"
                  onClick={() => setVisibleVehicles(visibleVehicles + 10)}
                >
                  Voir plus
                </button>
              )}

              {vehicles.length === 0 && (
                <EntityCard
                  title="Aucune donnée véhicule"
                  subtitle="Clôture mensuelle"
                  badge="VIDE"
                  badgeTone="blue"
                  items={[
                    {
                      label: 'Mois',
                      value: month
                    }
                  ]}
                />
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Consommation par division</h3>
            <p className="panel-subtitle">
              Répartition mensuelle par service.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              {divisions
                .slice(0, visibleDivisions)
                .map((division) => (
                  <EntityCard
                    key={division.id}
                    title={division.name}
                    subtitle={`Code : ${division.code}`}
                    badge="SERVICE"
                    badgeTone="green"
                    items={[
                      {
                        label: 'Litres',
                        value: `${division.totalLiters} L`
                      },
                      {
                        label: 'Montant',
                        value: `${division.totalAmount} FCFA`
                      },
                      {
                        label: 'Livraisons',
                        value: division.deliveries
                      }
                    ]}
                  />
                ))}

              {divisions.length > visibleDivisions && (
                <button
                  className="btn-secondary"
                  onClick={() => setVisibleDivisions(visibleDivisions + 10)}
                >
                  Voir plus
                </button>
              )}

              {divisions.length === 0 && (
                <EntityCard
                  title="Aucune donnée division"
                  subtitle="Clôture mensuelle"
                  badge="VIDE"
                  badgeTone="green"
                  items={[
                    {
                      label: 'Mois',
                      value: month
                    }
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}