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
            Détection des véhicules les plus consommateurs et des opérations suspectes.
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
            Classement consommation.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14
            }}
          >
            {topVehicles.map((vehicle) => (
              <EntityCard
                key={vehicle.vehicleId}
                title={vehicle.plateNumber}
                subtitle={vehicle.label || 'Véhicule'}
                badge="SUIVI"
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
                    value: vehicle.totalDeliveries
                  }
                ]}
              />
            ))}

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
            Bons ou opérations suspectes.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14
            }}
          >
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

            {anomalies.map((anomaly, index) => (
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}