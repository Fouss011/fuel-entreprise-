import {
  Activity,
  Building2,
  FileText,
  Fuel,
  Truck,
  Users
} from 'lucide-react'

import { useEffect, useState } from 'react'

import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/StatCard'

import {
  getDeliveriesReport,
  getDivisions,
  getFuelVouchers,
  getUsers,
  getVehicles
} from '../api/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    divisions: 0,
    vehicles: 0,
    users: 0,
    vouchers: 0,
    liters: 0,
    amount: 0
  })

  const [recentDeliveries, setRecentDeliveries] = useState([])

  async function loadData() {
    const [
      divisionsData,
      vehiclesData,
      usersData,
      vouchersData,
      deliveriesData
    ] = await Promise.all([
      getDivisions(),
      getVehicles(),
      getUsers(),
      getFuelVouchers(),
      getDeliveriesReport()
    ])

    const deliveries =
      deliveriesData.deliveries || []

    const totalLiters =
      deliveries.reduce(
        (sum, item) =>
          sum +
          Number(
            item.delivered_liters || 0
          ),
        0
      )

    const totalAmount =
      deliveries.reduce(
        (sum, item) =>
          sum +
          Number(
            item.total_amount || 0
          ),
        0
      )

    setStats({
      divisions:
        divisionsData.divisions?.length || 0,

      vehicles:
        vehiclesData.vehicles?.length || 0,

      users:
        usersData.users?.length || 0,

      vouchers:
        vouchersData.vouchers?.length || 0,

      liters: totalLiters,
      amount: totalAmount
    })

    setRecentDeliveries(
      deliveries.slice(0, 6)
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Tableau de pilotage
          </p>

          <h1 className="page-title">
            Centre de contrôle carburant
          </h1>

          <p className="page-subtitle">
            Supervision des véhicules,
            divisions, bons carburant,
            livraisons et consommations.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <StatCard
          title="Divisions"
          value={stats.divisions}
          subtitle="Services actifs"
          icon={<Building2 size={20} />}
          tone="blue"
        />

        <StatCard
          title="Véhicules"
          value={stats.vehicles}
          subtitle="Flotte enregistrée"
          icon={<Truck size={20} />}
          tone="blue"
        />

        <StatCard
          title="Utilisateurs"
          value={stats.users}
          subtitle="Comptes actifs"
          icon={<Users size={20} />}
          tone="green"
        />

        <StatCard
          title="Bons carburant"
          value={stats.vouchers}
          subtitle="Demandes enregistrées"
          icon={<FileText size={20} />}
          tone="amber"
        />
      </section>

      <section
        className="dashboard-grid"
        style={{
          gridTemplateColumns:
            'repeat(2, minmax(240px, 1fr))'
        }}
      >
        <StatCard
          title="Litres servis"
          value={`${stats.liters} L`}
          subtitle="Volume total distribué"
          icon={<Fuel size={20} />}
          tone="green"
        />

        <StatCard
          title="Montant total"
          value={`${stats.amount} FCFA`}
          subtitle="Consommation globale"
          icon={<Activity size={20} />}
          tone="amber"
        />
      </section>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">
            Dernières livraisons
          </h3>

          <p className="panel-subtitle">
            Activité récente des bons
            carburant confirmés.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 12
            }}
          >
            {recentDeliveries.map(
              (item) => (
                <div
                  key={item.id}
                  className="alert-card"
                >
                  <strong>
                    {
                      item.voucher
                        ?.voucher_number
                    }
                  </strong>

                  <br />

                  <span>
                    Véhicule :
                    {' '}
                    {
                      item.voucher
                        ?.vehicle
                        ?.plate_number
                    }
                  </span>

                  <br />

                  <span>
                    Division :
                    {' '}
                    {
                      item.voucher
                        ?.division?.name
                    }
                  </span>

                  <br />

                  <span>
                    Servi :
                    {' '}
                    {
                      item.delivered_liters
                    } L
                  </span>

                  <br />

                  <span>
                    Station :
                    {' '}
                    {item.station_name}
                  </span>

                  <br />

                  <span>
                    {
                      item.delivered_at
                        ? new Date(
                            item.delivered_at
                          ).toLocaleString(
                            'fr-FR'
                          )
                        : '-'
                    }
                  </span>
                </div>
              )
            )}

            {recentDeliveries.length ===
              0 && (
              <p
                style={{
                  color: '#64748b'
                }}
              >
                Aucune livraison récente.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">
            Workflow opérationnel
          </h3>

          <p className="panel-subtitle">
            Circuit sécurisé de gestion
            carburant.
          </p>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />

              <div>
                <h4>
                  1. Création du bon
                </h4>

                <p>
                  Le responsable division
                  émet une demande
                  carburant.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />

              <div>
                <h4>
                  2. Validation
                </h4>

                <p>
                  Le bon est validé par
                  la hiérarchie autorisée.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />

              <div>
                <h4>
                  3. Livraison
                </h4>

                <p>
                  Le pompiste confirme la
                  quantité réellement
                  servie.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />

              <div>
                <h4>
                  4. Reporting
                </h4>

                <p>
                  Les consommations sont
                  consolidées dans les
                  rapports mensuels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}