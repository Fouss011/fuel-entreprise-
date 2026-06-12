import { useEffect, useRef, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import EntityCard from '../components/EntityCard'
import {
  createVehicle,
  deleteVehicle,
  getDivisions,
  getVehicles,
  updateVehicle
} from '../api/api'

const vehicleTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'unclassified', label: 'Non classés' },
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

  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [activeTypeTab, setActiveTypeTab] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const formPanelRef = useRef(null)

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

  function resetForm() {
    setPlateNumber('')
    setLabel('')
    setVehicleType('pick-up')
    setFuelType('diesel')
    setDivisionId('')
    setEditingVehicleId(null)
    setError('')
  }

  function handleEdit(vehicle) {
  setEditingVehicleId(vehicle.id)
  setPlateNumber(vehicle.plate_number || '')
  setLabel(vehicle.label || '')
  setVehicleType(vehicle.vehicle_type || 'pick-up')
  setFuelType(vehicle.fuel_type || 'diesel')
  setDivisionId(vehicle.division_id || '')
  setError('')

  setTimeout(() => {
    formPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 100)
}

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      plateNumber,
      label,
      vehicleType,
      fuelType,
      divisionId: divisionId || null
    }

    const data = editingVehicleId
      ? await updateVehicle(editingVehicleId, payload)
      : await createVehicle(payload)

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    resetForm()
    await loadData()
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm(
  "Archiver ce véhicule ? Il ne sera plus disponible pour les nouveaux bons, mais les anciens rapports resteront visibles."
)) return

    const data = await deleteVehicle(id)

    if (data.error) {
      setError(data.error)
      return
    }

    if (editingVehicleId === id) {
      resetForm()
    }

    await loadData()
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const text = search.toLowerCase()
    const currentType = vehicle.vehicle_type?.toLowerCase()

    const matchesSearch =
      vehicle.plate_number?.toLowerCase().includes(text) ||
      vehicle.label?.toLowerCase().includes(text) ||
      vehicle.brand?.toLowerCase().includes(text) ||
      vehicle.vehicle_type?.toLowerCase().includes(text) ||
      vehicle.division?.name?.toLowerCase().includes(text) ||
      vehicle.division?.code?.toLowerCase().includes(text)

    const matchesType =
      activeTypeTab === 'all' ||
      (activeTypeTab === 'unclassified' && !currentType) ||
      currentType === activeTypeTab

    return matchesSearch && matchesType
  })

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Flotte</p>
          <h1 className="page-title">Véhicules</h1>
          <p className="page-subtitle">
            Enregistre, classe et corrige les véhicules suivis par la plateforme.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des véhicules</h3>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher véhicule, plaque, catégorie, division..."
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

          <p className="panel-subtitle">
            {activeTypeTab === 'unclassified'
              ? 'Véhicules sans catégorie à corriger.'
              : 'Véhicules rattachés aux divisions.'}
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredVehicles
              .slice(0, visibleCount)
              .map((vehicle) => (
                <EntityCard
                  key={vehicle.id}
                  title={vehicle.plate_number}
                  subtitle={vehicle.label || 'Véhicule'}
                  badge="ARCHIVER"
                  badgeTone="amber"
                  onAction={() => handleDelete(vehicle.id)}
                  items={[
                    {
                      label: 'Catégorie',
                      value: vehicle.vehicle_type || 'Non classé'
                    },
                    {
                      label: 'Carburant',
                      value: vehicle.fuel_type || '-'
                    },
                    {
                      label: 'Division',
                      value: vehicle.division?.code
                        ? `${vehicle.division.code} — ${vehicle.division.name}`
                        : vehicle.division?.name || '-'
                    },
                    {
                      label: 'Modifier',
                      value: (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleEdit(vehicle)}
                          style={{
                            padding: '7px 10px',
                            fontSize: 12
                          }}
                        >
                          MODIFIER
                        </button>
                      )
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

        <div className="panel" ref={formPanelRef}>
          <h3 className="panel-title">
            {editingVehicleId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </h3>

          <p className="panel-subtitle">
            {editingVehicleId
              ? 'Corrige la catégorie sans refaire la saisie.'
              : 'Le libellé décrit le véhicule. La catégorie sert au classement.'}
          </p>

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
              placeholder="Libellé véhicule ex: Camion citerne MAN"
              className="form-input"
            />

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="form-input"
            >
              <option value="pick-up">Catégorie : Pick-up</option>
              <option value="camion">Catégorie : Camion</option>
              <option value="bus">Catégorie : Bus</option>
              <option value="engin">Catégorie : Engin</option>
              <option value="voiture">Catégorie : Voiture</option>
              <option value="moto">Catégorie : Moto</option>
              <option value="autre">Catégorie : Autre</option>
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
              <option value="">Aucune division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.code
                    ? `${division.code} — ${division.name}`
                    : division.name}
                </option>
              ))}
            </select>

            {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

            <button className="btn-primary" disabled={loading}>
              {loading
                ? editingVehicleId
                  ? 'Modification...'
                  : 'Ajout...'
                : editingVehicleId
                  ? 'Mettre à jour le véhicule'
                  : 'Ajouter le véhicule'}
            </button>

            {editingVehicleId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Annuler la modification
              </button>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  )
}