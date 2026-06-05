import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'

import {
  getAnalytics
} from '../api/api'

export default function AnalyticsPage() {
  const [topVehicles, setTopVehicles] = useState([])
  const [anomalies, setAnomalies] = useState([])

  const [visibleVehicles, setVisibleVehicles] = useState(10)
  const [visibleAnomalies, setVisibleAnomalies] = useState(10)

  async function loadAnalytics() {
    const data = await getAnalytics()

    setTopVehicles(data.topVehicles || [])
    setAnomalies(data.anomalies || [])
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Intelligence carburant
          </p>

          <h1 className="page-title">
            Analytics & anomalies
          </h1>

          <p className="page-subtitle">
            Suivi des véhicules les plus consommateurs et des opérations à contrôler.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8
            }}
          >
            <TrendingUp size={20} />

            <h3 className="panel-title" style={{ margin: 0 }}>
              Top véhicules consommateurs
            </h3>
          </div>

          <p className="panel-subtitle">
            Classement par volume de carburant servi.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {topVehicles
              .slice(0, visibleVehicles)
              .map((vehicle) => (
                <EntityCard
                  key={vehicle.vehicleId}
                  title={vehicle.plateNumber}
                  subtitle={vehicle.label || 'Véhicule'}
                  badge="SUIVI"
                  badgeTone="blue"
                  items={[
                    {
                      label: 'Litres',
                      value: `${vehicle.totalLiters || 0} L`
                    },
                    {
                      label: 'Kilométrage relevé',
                      value: `${vehicle.totalOdometer || 0} km`
                    },
                    {
                      label: 'Livraisons',
                      value: vehicle.totalDeliveries || 0
                    }
                  ]}
                />
              ))}

            {topVehicles.length > visibleVehicles && (
              <button
                className="btn-secondary"
                onClick={() => setVisibleVehicles(visibleVehicles + 10)}
              >
                Voir plus
              </button>
            )}

            {topVehicles.length === 0 && (
              <EntityCard
                title="Aucune donnée"
                subtitle="Analyse carburant"
                badge="VIDE"
                badgeTone="blue"
                items={[
                  {
                    label: 'Statut',
                    value: 'Aucune livraison'
                  }
                ]}
              />
            )}
          </div>
        </div>

        <div className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8
            }}
          >
            <AlertTriangle size={20} />

            <h3 className="panel-title" style={{ margin: 0 }}>
              Anomalies détectées
            </h3>
          </div>

          <p className="panel-subtitle">
            Alertes simples sur les bons et opérations carburant.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {anomalies.length === 0 && (
              <EntityCard
                title="Aucune anomalie détectée"
                subtitle="Contrôle carburant"
                badge="OK"
                badgeTone="success"
                items={[
                  {
                    label: 'Statut',
                    value: 'Aucune opération suspecte'
                  },
                  {
                    label: 'Contrôle',
                    value: 'Livraisons conformes'
                  }
                ]}
              />
            )}

            {anomalies
              .slice(0, visibleAnomalies)
              .map((anomaly, index) => (
                <EntityCard
                  key={index}
                  title={anomaly.type}
                  subtitle={`Bon : ${anomaly.voucherNumber || '-'}`}
                  badge="ALERTE"
                  badgeTone="danger"
                  items={[
                    {
                      label: 'Véhicule',
                      value: anomaly.plateNumber || '-'
                    },
                    {
                      label: 'Approuvé',
                      value: anomaly.approved
                        ? `${anomaly.approved} L`
                        : '-'
                    },
                    {
                      label: 'Livré',
                      value: anomaly.delivered
                        ? `${anomaly.delivered} L`
                        : '-'
                    }
                  ]}
                />
              ))}

            {anomalies.length > visibleAnomalies && (
              <button
                className="btn-secondary"
                onClick={() => setVisibleAnomalies(visibleAnomalies + 10)}
              >
                Voir plus
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}