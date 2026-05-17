import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FileText, Fuel, Wallet } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

  async function exportPDF() {
    if (!exportRef.current) return

    setExporting(true)

    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      backgroundColor: '#f3f6fb'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save(`historique-vehicule-${month || 'toutes-periodes'}.pdf`)
    setExporting(false)
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    if (vehicleId) {
      loadHistory(vehicleId, month)
    }
  }, [vehicleId, month])

  const filteredDeliveries = deliveries

  const stats = useMemo(() => {
    return {
      totalDeliveries: filteredDeliveries.length,
      totalLiters: filteredDeliveries.reduce(
        (sum, item) => sum + Number(item.delivered_liters || 0),
        0
      ),
      totalAmount: filteredDeliveries.reduce(
        (sum, item) => sum + Number(item.total_amount || 0),
        0
      )
    }
  }, [filteredDeliveries])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Historique flotte</p>
          <h1 className="page-title">Historique véhicule</h1>
          <p className="page-subtitle">
            Suivi détaillé des consommations par véhicule.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={exportPDF} disabled={exporting}>
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
                `${item.label || 'Véhicule'} — ${item.division?.name || '-'}`
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
            gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))'
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
            subtitle="Consommation du véhicule"
            icon={<Fuel size={21} />}
            tone="green"
          />

          <StatCard
            title="Montant"
            value={`${stats.totalAmount} FCFA`}
            subtitle="Coût total"
            icon={<Wallet size={21} />}
            tone="amber"
          />
        </section>

        <div className="panel">
          <h3 className="panel-title">Détail des livraisons</h3>
          <p className="panel-subtitle">
            Bons, dates, pompistes et quantités servies.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {filteredDeliveries.map((item) => (
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
                    value: item.voucher?.division?.name || '-'
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
                    label: 'Pompiste',
                    value: item.pompiste?.full_name || '-'
                  }
                ]}
              />
            ))}

            {filteredDeliveries.length === 0 && (
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