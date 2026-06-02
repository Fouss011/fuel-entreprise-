import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import {
  createVehicle,
  deleteVehicle,
  getDivisions,
  getVehicles
} from '../api/api'

const vehicleTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'pick-up', label: 'Pick-up' },
  { value: 'camion', label: 'Camions' },
  { value: 'bus', label: 'Bus' },
  { value: 'engin', label: 'Engins' },
  { value: 'voiture', label: 'Voitures' },
  { value: 'moto', label: 'Motos' },
  { value: 'autre', label: 'Autres' }
]

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [search, setSearch] = useState('')
  const [divisions, setDivisions] = useState([])

  const [plateNumber, setPlateNumber] = useState('')
  const [label, setLabel] = useState('')
  const [vehicleType, setVehicleType] = useState('pick-up')
  const [fuelType, setFuelType] = useState('diesel')
  const [divisionId, setDivisionId] = useState('')

  const [activeTypeTab, setActiveTypeTab] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  async function loadData() {
    const [vehiclesData, divisionsData] = await Promise.all([
      getVehicles(),
      getDivisions()
    ])

    setVehicles(vehiclesData.vehicles || [])
    setDivisions(divisionsData.divisions || [])

    if (!divisionId && divisionsData.divisions?.[0]) {
      setDivisionId(divisionsData.divisions[0].id)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await createVehicle({
      plateNumber,
      label,
      vehicleType,
      fuelType,
      divisionId
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setPlateNumber('')
    setLabel('')
    setVehicleType('pick-up')
    setFuelType('diesel')
    await loadData()
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce véhicule ?')) return

    const data = await deleteVehicle(id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadData()
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const text = search.toLowerCase()

    const matchesSearch =
      vehicle.plate_number?.toLowerCase().includes(text) ||
      vehicle.label?.toLowerCase().includes(text) ||
      vehicle.brand?.toLowerCase().includes(text) ||
      vehicle.vehicle_type?.toLowerCase().includes(text)

    const matchesType =
      activeTypeTab === 'all' ||
      vehicle.vehicle_type?.toLowerCase() === activeTypeTab

    return matchesSearch && matchesType
  })

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Flotte</p>
          <h1 className="page-title">Véhicules</h1>
          <p className="page-subtitle">
            Enregistre les véhicules de fonction, camions, engins ou pick-up suivis par la plateforme.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des véhicules</h3>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher véhicule, plaque, marque..."
            className="form-input"
            style={{
              marginTop: 14,
              marginBottom: 16
            }}
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16
            }}
          >
            {vehicleTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setActiveTypeTab(item.value)
                  setVisibleCount(10)
                }}
                className={
                  activeTypeTab === item.value
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
                style={{
                  padding: '8px 12px',
                  fontSize: 13
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="panel-subtitle">Véhicules rattachés aux divisions.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredVehicles
              .slice(0, visibleCount)
              .map((vehicle) => (
                <EntityCard
                  key={vehicle.id}
                  title={vehicle.plate_number}
                  subtitle={vehicle.label || 'Véhicule'}
                  badge="SUPPRIMER"
                  badgeTone="danger"
                  onAction={() => handleDelete(vehicle.id)}
                  items={[
                    {
                      label: 'Type',
                      value: vehicle.vehicle_type || '-'
                    },
                    {
                      label: 'Carburant',
                      value: vehicle.fuel_type || '-'
                    },
                    {
                      label: 'Division',
                      value: vehicle.division?.name || '-'
                    }
                  ]}
                />
              ))}

            {filteredVehicles.length > visibleCount && (
              <button
                className="btn-secondary"
                onClick={() => setVisibleCount(visibleCount + 10)}
              >
                Voir plus
              </button>
            )}

            {filteredVehicles.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucun véhicule enregistré.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Ajouter un véhicule</h3>
          <p className="panel-subtitle">Exemple : TG-1234-A, Pick-up Direction Mines.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="Immatriculation"
              className="form-input"
            />

            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Libellé véhicule"
              className="form-input"
            />

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="form-input"
            >
              <option value="pick-up">Pick-up</option>
              <option value="camion">Camion</option>
              <option value="bus">Bus</option>
              <option value="engin">Engin</option>
              <option value="voiture">Voiture</option>
              <option value="moto">Moto</option>
              <option value="autre">Autre</option>
            </select>

            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="form-input"
            >
              <option value="diesel">Diesel</option>
              <option value="essence">Essence</option>
            </select>

            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="form-input"
            >
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>

            {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Ajout...' : 'Ajouter le véhicule'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}