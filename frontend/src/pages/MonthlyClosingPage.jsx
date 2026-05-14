import { useEffect, useMemo, useState } from 'react'

import {
  CalendarDays,
  FileText,
  Fuel,
  Wallet
} from 'lucide-react'

import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/StatCard'
import EntityCard from '../components/EntityCard'

import {
  getDeliveriesReport
} from '../api/api'

export default function MonthlyClosingPage() {
  const [deliveries, setDeliveries] = useState([])
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  async function loadData() {
    const data = await getDeliveriesReport()
    setDeliveries(data.deliveries || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(
      (item) =>
        item.delivered_at?.slice(0, 7) === month
    )
  }, [deliveries, month])

  const stats = useMemo(() => {
    return {
      totalDeliveries:
        filteredDeliveries.length,

      totalLiters:
        filteredDeliveries.reduce(
          (sum, item) =>
            sum +
            Number(item.delivered_liters || 0),
          0
        ),

      totalAmount:
        filteredDeliveries.reduce(
          (sum, item) =>
            sum +
            Number(item.total_amount || 0),
          0
        )
    }
  }, [filteredDeliveries])

  const divisions = useMemo(() => {
    const map = {}

    filteredDeliveries.forEach((item) => {
      const division =
        item.voucher?.division

      if (!division) return

      if (!map[division.id]) {
        map[division.id] = {
          name: division.name,
          code: division.code,
          liters: 0,
          amount: 0,
          deliveries: 0
        }
      }

      map[division.id].liters += Number(
        item.delivered_liters || 0
      )

      map[division.id].amount += Number(
        item.total_amount || 0
      )

      map[division.id].deliveries += 1
    })

    return Object.values(map)
  }, [filteredDeliveries])

  const vehicles = useMemo(() => {
    const map = {}

    filteredDeliveries.forEach((item) => {
      const vehicle =
        item.voucher?.vehicle

      if (!vehicle) return

      if (!map[vehicle.id]) {
        map[vehicle.id] = {
          plate: vehicle.plate_number,
          label: vehicle.label,
          liters: 0,
          amount: 0,
          deliveries: 0
        }
      }

      map[vehicle.id].liters += Number(
        item.delivered_liters || 0
      )

      map[vehicle.id].amount += Number(
        item.total_amount || 0
      )

      map[vehicle.id].deliveries += 1
    })

    return Object.values(map)
  }, [filteredDeliveries])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Audit mensuel
          </p>

          <h1 className="page-title">
            Clôture mensuelle
          </h1>

          <p className="page-subtitle">
            Consolidation des consommations carburant par véhicule et division.
          </p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 22 }}>
        <h3 className="panel-title">
          Période d’analyse
        </h3>

        <div
          style={{
            marginTop: 14,
            maxWidth: 320
          }}
        >
          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
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
          value={stats.totalDeliveries}
          subtitle="Opérations confirmées"
          icon={<FileText size={21} />}
          tone="blue"
        />

        <StatCard
          title="Litres"
          value={stats.totalLiters}
          subtitle="Volume total"
          icon={<Fuel size={21} />}
          tone="green"
        />

        <StatCard
          title="Montant"
          value={`${stats.totalAmount} FCFA`}
          subtitle="Coût mensuel"
          icon={<Wallet size={21} />}
          tone="amber"
        />
      </section>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">
            Consommation par véhicule
          </h3>

          <p className="panel-subtitle">
            Classement mensuel de la flotte.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14
            }}
          >
            {vehicles.map((vehicle, index) => (
              <EntityCard
                key={index}
                title={vehicle.plate}
                subtitle={
                  vehicle.label || 'Véhicule'
                }
                badge="FLOTTE"
                badgeTone="blue"
                items={[
                  {
                    label: 'Litres',
                    value: `${vehicle.liters} L`
                  },
                  {
                    label: 'Montant',
                    value: `${vehicle.amount} FCFA`
                  },
                  {
                    label: 'Livraisons',
                    value: vehicle.deliveries
                  }
                ]}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">
            Consommation par division
          </h3>

          <p className="panel-subtitle">
            Répartition mensuelle par service.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14
            }}
          >
            {divisions.map((division, index) => (
              <EntityCard
                key={index}
                title={division.name}
                subtitle={`Code : ${division.code}`}
                badge="SERVICE"
                badgeTone="green"
                items={[
                  {
                    label: 'Litres',
                    value: `${division.liters} L`
                  },
                  {
                    label: 'Montant',
                    value: `${division.amount} FCFA`
                  },
                  {
                    label: 'Livraisons',
                    value: division.deliveries
                  }
                ]}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}