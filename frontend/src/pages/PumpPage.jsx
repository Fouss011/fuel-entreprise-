import { useEffect, useState } from 'react'
import { CheckCircle2, Fuel, RefreshCw, Search } from 'lucide-react'

import MainLayout from '../layouts/MainLayout'

import {
  deliverFuel,
  getApprovedVouchers,
  searchVoucherByCode
} from '../api/api'

export default function PumpPage() {
  const [vouchers, setVouchers] = useState([])
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  const [searchCode, setSearchCode] = useState('')
  const [deliveredLiters, setDeliveredLiters] = useState('')
  const [odometerKm, setOdometerKm] = useState('')
  const [stationName, setStationName] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function loadVouchers() {
    setRefreshing(true)
    setError('')

    const data = await getApprovedVouchers()

    setVouchers(data.vouchers || [])
    setRefreshing(false)
  }

  useEffect(() => {
    loadVouchers()
  }, [])

  async function handleSearchVoucher() {
    if (!searchCode.trim()) return

    setError('')

    const data = await searchVoucherByCode(searchCode)

    if (data.vouchers && data.vouchers.length > 0) {
      const voucher = data.vouchers[0]

      setSelectedVoucher(voucher)
      setDeliveredLiters(voucher.approved_liters || '')
      setOdometerKm('')
      return
    }

    setSelectedVoucher(null)
    setError('Aucun bon trouvé avec ce code.')
  }

  async function handleDeliver(e) {
    e.preventDefault()

    if (!selectedVoucher) return

    setLoading(true)
    setError('')

    const data = await deliverFuel({
      voucherId: selectedVoucher.id,
      deliveredLiters,
      odometerKm,
      stationName,
      deliveryNotes
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSelectedVoucher(null)
    setSearchCode('')
    setDeliveredLiters('')
    setOdometerKm('')
    setStationName('')
    setDeliveryNotes('')

    await loadVouchers()
    setLoading(false)
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Livraison carburant</p>
          <h1 className="page-title">Espace pompiste</h1>
          <p className="page-subtitle">
            Le pompiste confirme la quantité réellement servie et relève le kilométrage du véhicule.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={loadVouchers}>
            <RefreshCw size={16} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 18
        }}
      >
        <section className="panel">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 14,
              alignItems: 'flex-start',
              marginBottom: 18
            }}
          >
            <div>
              <h3 className="panel-title">Bons à servir</h3>
              <p className="panel-subtitle" style={{ marginBottom: 0 }}>
                {vouchers.length === 0
                  ? 'Aucun bon validé disponible.'
                  : `${vouchers.length} bon(s) validé(s) en attente de service.`}
              </p>
            </div>

            <div
              style={{
                minWidth: 46,
                height: 46,
                borderRadius: 14,
                background: '#e8f0ff',
                color: '#1d4ed8',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 18
              }}
            >
              {vouchers.length}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {vouchers.map((voucher) => {
              const active = selectedVoucher?.id === voucher.id

              return (
                <button
                  key={voucher.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoucher(voucher)
                    setDeliveredLiters(voucher.approved_liters || '')
                    setOdometerKm('')
                    setError('')
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 16,
                    padding: 18,
                    border: active
                      ? '2px solid #1d4ed8'
                      : '1px solid #dbe3ee',
                    background: active ? '#f0f6ff' : '#ffffff',
                    boxShadow: active
                      ? '0 10px 24px rgba(29,78,216,0.12)'
                      : '0 4px 12px rgba(15,23,42,0.04)',
                    color: '#0f172a'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 14,
                      alignItems: 'center',
                      marginBottom: 14
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          color: '#07172f',
                          fontSize: 17,
                          fontWeight: 900
                        }}
                      >
                        {voucher.voucher_number}
                      </strong>

                      <p
                        style={{
                          color: '#64748b',
                          marginTop: 4,
                          fontSize: 13
                        }}
                      >
                        Bon validé prêt à être servi
                      </p>
                    </div>

                    <span
                      style={{
                        padding: '7px 11px',
                        borderRadius: 999,
                        background: '#e6f6f3',
                        color: '#0f766e',
                        fontSize: 12,
                        fontWeight: 900
                      }}
                    >
                      VALIDÉ
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10
                    }}
                  >
                    <Info label="Véhicule" value={voucher.vehicle?.plate_number || '-'} />
                    <Info label="Division" value={voucher.division?.code ? `${voucher.division.code} — ${voucher.division.name}` : voucher.division?.name || '-'} />
                    <Info label="Chauffeur" value={voucher.driver?.full_name || '-'} />
                    <Info label="Quantité approuvée" value={`${voucher.approved_liters || 0} L`} />
                  </div>
                </button>
              )
            })}

            {vouchers.length === 0 && (
              <div
                style={{
                  padding: 22,
                  borderRadius: 16,
                  border: '1px dashed #cbd7e6',
                  background: '#f8fafc',
                  color: '#64748b'
                }}
              >
                Aucun bon à servir pour le moment.
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <h3 className="panel-title">Confirmer livraison</h3>
          <p className="panel-subtitle">
            Recherche un bon par code ou sélectionne-le dans la liste.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              marginBottom: 18
            }}
          >
            <input
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ex : 9946 ou SNPT-2026-05-9946"
              className="form-input"
            />

            <button
              type="button"
              className="btn-primary"
              onClick={handleSearchVoucher}
            >
              <Search size={16} />
              Rechercher
            </button>
          </div>

          {!selectedVoucher && (
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: '#f8fafc',
                border: '1px solid #dbe3ee',
                color: '#64748b',
                lineHeight: 1.5
              }}
            >
              Sélectionne un bon validé pour confirmer la livraison.
            </div>
          )}

          {selectedVoucher && (
            <form onSubmit={handleDeliver} style={{ display: 'grid', gap: 14 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: '#07172f',
                  color: '#ffffff'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12
                  }}
                >
                  <Fuel size={18} />
                  <strong>{selectedVoucher.voucher_number}</strong>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Véhicule : {selectedVoucher.vehicle?.plate_number || '-'}
                </p>
                <p style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Division : {selectedVoucher.division?.code
                    ? `${selectedVoucher.division.code} — ${selectedVoucher.division.name}`
                    : selectedVoucher.division?.name || '-'}
                </p>
                <p style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Chauffeur : {selectedVoucher.driver?.full_name || '-'}
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: '#e6f6f3',
                  border: '1px solid #bfe8df'
                }}
              >
                <strong style={{ color: '#0f766e' }}>
                  Quantité approuvée
                </strong>
                <p
                  style={{
                    color: '#07172f',
                    fontSize: 24,
                    fontWeight: 900,
                    marginTop: 6
                  }}
                >
                  {selectedVoucher.approved_liters || 0} L
                </p>
              </div>

              <input
                value={deliveredLiters}
                onChange={(e) => setDeliveredLiters(e.target.value)}
                placeholder="Quantité réellement servie"
                className="form-input"
                type="number"
              />

              <input
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="Kilométrage compteur du véhicule"
                className="form-input"
                type="number"
              />

              <input
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Station / pompe"
                className="form-input"
              />

              <input
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Observation"
                className="form-input"
              />

              {error && (
                <p
                  style={{
                    color: '#b91c1c',
                    background: '#fee2e2',
                    padding: 12,
                    borderRadius: 10,
                    fontWeight: 700
                  }}
                >
                  {error}
                </p>
              )}

              <button className="btn-primary" disabled={loading}>
                <CheckCircle2 size={17} />
                {loading ? 'Validation...' : 'Confirmer livraison'}
              </button>
            </form>
          )}

          {!selectedVoucher && error && (
            <p
              style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: 12,
                borderRadius: 10,
                marginTop: 14,
                fontWeight: 700
              }}
            >
              {error}
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  )
}

function Info({ label, value }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      <p
        style={{
          color: '#64748b',
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 4
        }}
      >
        {label}
      </p>

      <strong
        style={{
          color: '#07172f',
          fontSize: 14
        }}
      >
        {value}
      </strong>
    </div>
  )
}