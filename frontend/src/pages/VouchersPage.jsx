import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import MainLayout from '../layouts/MainLayout'
import SearchSelect from '../components/SearchSelect'
import EntityCard from '../components/EntityCard'
import {
  approveFuelVoucher,
  createFuelVoucher,
  deleteFuelVoucher,
  getDivisions,
  getFuelVouchers,
  getUsers,
  getVehicles,
  rejectFuelVoucher
} from '../api/api'

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([])
  const [search, setSearch] = useState('')
  const [divisions, setDivisions] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [users, setUsers] = useState([])

  const [divisionId, setDivisionId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [requestedLiters, setRequestedLiters] = useState('')
  const [fuelType, setFuelType] = useState('diesel')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const [vouchersData, divisionsData, vehiclesData, usersData] = await Promise.all([
      getFuelVouchers(),
      getDivisions(),
      getVehicles(),
      getUsers()
    ])

    setVouchers(vouchersData.vouchers || [])
    setDivisions(divisionsData.divisions || [])
    setVehicles(vehiclesData.vehicles || [])
    setUsers(usersData.users || [])

    if (!divisionId && divisionsData.divisions?.[0]) setDivisionId(divisionsData.divisions[0].id)
    if (!vehicleId && vehiclesData.vehicles?.[0]) setVehicleId(vehiclesData.vehicles[0].id)
  }

  useEffect(() => {
    loadData()
  }, [])

  function formatDate(value) {
    if (!value) return '-'
    return new Date(value).toLocaleString('fr-FR')
  }

  function statusLabel(status) {
    if (status === 'pending') return 'En attente'
    if (status === 'approved') return 'Approuvé'
    if (status === 'rejected') return 'Refusé'
    if (status === 'used') return 'Utilisé'
    return status || '-'
  }

  function exportVoucherPdf(voucher) {
    const doc = new jsPDF()

    const divisionText = voucher.division?.code
      ? `${voucher.division.code} - ${voucher.division.name}`
      : voucher.division?.name || '-'

    const vehicleText = voucher.vehicle?.label
      ? `${voucher.vehicle.plate_number} - ${voucher.vehicle.label}`
      : voucher.vehicle?.plate_number || '-'

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('BON DE COMMANDE CARBURANT', 105, 18, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° Bon : ${voucher.voucher_number || '-'}`, 14, 34)
    doc.text(`Date de création : ${formatDate(voucher.created_at)}`, 14, 42)
    doc.text(`Statut : ${statusLabel(voucher.status)}`, 14, 50)

    doc.line(14, 58, 196, 58)

    doc.setFont('helvetica', 'bold')
    doc.text('Informations du bon', 14, 70)

    doc.setFont('helvetica', 'normal')
    doc.text(`Division / Service : ${divisionText}`, 14, 82)
    doc.text(`Véhicule : ${vehicleText}`, 14, 92)
    doc.text(`Chauffeur / bénéficiaire : ${voucher.driver?.full_name || '-'}`, 14, 102)
    doc.text(`Carburant : ${voucher.fuel_type || '-'}`, 14, 112)
    doc.text(`Quantité demandée : ${voucher.requested_liters || 0} L`, 14, 122)
    doc.text(`Quantité approuvée : ${voucher.approved_liters || 0} L`, 14, 132)

    doc.line(14, 142, 196, 142)

    doc.setFont('helvetica', 'bold')
    doc.text('Validation', 14, 154)

    doc.setFont('helvetica', 'normal')
    doc.text(`Date validation : ${formatDate(voucher.approved_at)}`, 14, 166)
    doc.text(`Structure : ${voucher.structure?.name || '-'}`, 14, 176)

    doc.line(14, 190, 196, 190)

    doc.setFontSize(10)
    doc.text('Document généré automatiquement par Fuel Enterprise.', 14, 204)
    doc.text('Signature / Cachet : ___________________________', 14, 220)

    doc.save(`${voucher.voucher_number || 'bon-carburant'}.pdf`)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await createFuelVoucher({
      divisionId,
      vehicleId,
      driverId,
      requestedLiters,
      fuelType,
      notes
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setRequestedLiters('')
    setNotes('')
    await loadData()
    setLoading(false)
  }

  async function handleApprove(voucher) {
    const approvedLiters = window.prompt(
      'Quantité approuvée en litres',
      voucher.requested_liters
    )

    if (!approvedLiters) return

    await approveFuelVoucher(voucher.id, { approvedLiters })
    await loadData()
  }

  async function handleReject(voucher) {
    if (!window.confirm('Refuser ce bon ?')) return
    await rejectFuelVoucher(voucher.id)
    await loadData()
  }

  async function handleDelete(voucher) {
    if (!window.confirm('Supprimer ce bon carburant ?')) return

    const data = await deleteFuelVoucher(voucher.id)

    if (data.error) {
      setError(data.error)
      return
    }

    await loadData()
  }

  const filteredVouchers = vouchers.filter((voucher) => {
    const text = search.toLowerCase()

    return (
      voucher.voucher_number?.toLowerCase().includes(text) ||
      voucher.vehicle?.plate_number?.toLowerCase().includes(text) ||
      voucher.vehicle?.label?.toLowerCase().includes(text) ||
      voucher.driver?.full_name?.toLowerCase().includes(text) ||
      voucher.division?.name?.toLowerCase().includes(text) ||
      voucher.division?.code?.toLowerCase().includes(text) ||
      voucher.status?.toLowerCase().includes(text)
    )
  })

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Bons numériques</p>
          <h1 className="page-title">Bons carburant</h1>
          <p className="page-subtitle">
            Crée, valide, refuse ou exporte les bons carburant en PDF.
          </p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3 className="panel-title">Liste des bons</h3>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher bon, véhicule, chauffeur, division..."
            className="form-input"
            style={{
              marginTop: 14,
              marginBottom: 16
            }}
          />

          <p className="panel-subtitle">Historique des demandes et validations.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            {filteredVouchers.map((voucher) => (
              <div
                key={voucher.id}
                style={{
                  display: 'grid',
                  gap: 0,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 18,
                  padding: 0,
                  boxShadow: 'none'
                }}
              >
                <EntityCard
                  title={voucher.voucher_number}
                  subtitle={`Statut : ${statusLabel(voucher.status)}`}
                  badge="SUPPRIMER"
                  badgeTone="danger"
                  onAction={() => handleDelete(voucher)}
                  items={[
                    {
                      label: 'Véhicule',
                      value: voucher.vehicle?.plate_number || '-'
                    },
                    {
                      label: 'Division',
                      value: voucher.division?.code
                        ? `${voucher.division.code} — ${voucher.division.name}`
                        : voucher.division?.name || '-'
                    },
                    {
                      label: 'Demandé',
                      value: `${voucher.requested_liters || 0} L`
                    },
                    {
                      label: 'Approuvé',
                      value: `${voucher.approved_liters || 0} L`
                    }
                  ]}
                />

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: -2,
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    className="btn-secondary"
                    onClick={() => exportVoucherPdf(voucher)}
                    style={{
                      flex: 1,
                      minHeight: 42,
                      borderRadius: 12
                    }}
                  >
                    Export PDF
                  </button>

                  {voucher.status === 'pending' && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => handleApprove(voucher)}
                        style={{
                          flex: 1,
                          minHeight: 42,
                          borderRadius: 12
                        }}
                      >
                        Valider
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => handleReject(voucher)}
                        style={{
                          flex: 1,
                          minHeight: 42,
                          borderRadius: 12
                        }}
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredVouchers.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucun bon enregistré.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Créer un bon</h3>
          <p className="panel-subtitle">Associe une division, un véhicule et une quantité.</p>

          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
            <SearchSelect
              label="Division / service"
              placeholder="Rechercher une division..."
              items={divisions}
              value={divisionId}
              onChange={setDivisionId}
              getLabel={(item) => item.code ? `${item.code} — ${item.name}` : item.name}
              getSubLabel={(item) => `Code : ${item.code || '-'}`}
            />

            <SearchSelect
              label="Véhicule"
              placeholder="Rechercher par plaque ou nom..."
              items={vehicles}
              value={vehicleId}
              onChange={setVehicleId}
              getLabel={(item) => item.plate_number}
              getSubLabel={(item) =>
                `${item.label || 'Véhicule'} — ${
                  item.division?.code
                    ? `${item.division.code} / ${item.division.name}`
                    : item.division?.name || 'Division non renseignée'
                }`
              }
            />

            <SearchSelect
              label="Chauffeur / bénéficiaire"
              placeholder="Rechercher un chauffeur..."
              items={users}
              value={driverId}
              onChange={setDriverId}
              getLabel={(item) => item.full_name}
              getSubLabel={(item) => item.email || item.role || '-'}
            />

            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="form-input"
            >
              <option value="diesel">Diesel</option>
              <option value="essence">Essence</option>
            </select>

            <input
              value={requestedLiters}
              onChange={(e) => setRequestedLiters(e.target.value)}
              placeholder="Quantité demandée en litres"
              className="form-input"
              type="number"
            />

            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note / motif"
              className="form-input"
            />

            {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer le bon'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}