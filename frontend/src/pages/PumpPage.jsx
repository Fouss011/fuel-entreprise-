import { useEffect, useState } from 'react'
import { CheckCircle2, Fuel, LogOut, RefreshCw, Search } from 'lucide-react'

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
  const [unitPrice, setUnitPrice] = useState('')
  const [stationName, setStationName] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('fuel_user') || '{}')

  function logout() {
    localStorage.removeItem('fuel_token')
    localStorage.removeItem('fuel_user')
    window.location.href = '/login'
  }

  async function loadVouchers() {
    try {
      setRefreshing(true)
      setError('')

      const data = await getApprovedVouchers()

      if (data.error) {
        setError(data.error)
        setVouchers([])
        return
      }

      setVouchers(data.vouchers || [])
    } catch {
      setError('Erreur chargement bons validés')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadVouchers()
  }, [])

  async function handleSearchVoucher() {
    if (!searchCode.trim()) return

    try {
      setError('')

      const data = await searchVoucherByCode(searchCode)

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.vouchers && data.vouchers.length > 0) {
        const voucher = data.vouchers[0]
        setSelectedVoucher(voucher)
        setDeliveredLiters(voucher.approved_liters || '')
        return
      }

      setSelectedVoucher(null)
      setError('Aucun bon validé trouvé avec ce code.')
    } catch {
      setError('Erreur recherche bon')
    }
  }

  async function handleDeliver(e) {
    e.preventDefault()

    if (!selectedVoucher) return

    try {
      setLoading(true)
      setError('')

      const data = await deliverFuel({
        voucherId: selectedVoucher.id,
        deliveredLiters,
        unitPrice,
        stationName,
        deliveryNotes
      })

      if (data.error) {
        setError(data.error)
        return
      }

      setSelectedVoucher(null)
      setSearchCode('')
      setDeliveredLiters('')
      setUnitPrice('')
      setStationName('')
      setDeliveryNotes('')

      await loadVouchers()
    } catch {
      setError('Erreur validation livraison')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f6fb' }}>
      <header
        style={{
          background: '#07172f',
          color: '#ffffff',
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/favicon.png"
            alt="Fuel Manager"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#ffffff',
              objectFit: 'contain'
            }}
          />

          <div>
            <strong>Fuel Manager</strong>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>
              Espace pompiste · {user.fullName || 'Utilisateur'}
            </p>
          </div>
        </div>

        <button onClick={logout} className="btn-secondary">
          <LogOut size={16} />
          Sortir
        </button>
      </header>

      <main style={{ padding: 18, maxWidth: 1100, margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Livraison carburant</p>
            <h1 className="page-title">Espace pompiste</h1>
            <p className="page-subtitle">
              Recherche un bon validé, sers le carburant, puis confirme la livraison.
            </p>
          </div>

          <button className="btn-secondary" onClick={loadVouchers}>
            <RefreshCw size={16} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 900 ? '1fr' : '1.1fr 0.9fr',
            gap: 18
          }}
        >
          <section className="panel">
            <h3 className="panel-title">Bons validés</h3>
            <p className="panel-subtitle">
              {vouchers.length === 0
                ? 'Aucun bon validé disponible.'
                : `${vouchers.length} bon(s) en attente de service.`}
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {vouchers.map((voucher) => (
                <button
                  key={voucher.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoucher(voucher)
                    setDeliveredLiters(voucher.approved_liters || '')
                    setError('')
                  }}
                  style={{
                    textAlign: 'left',
                    padding: 16,
                    borderRadius: 14,
                    border:
                      selectedVoucher?.id === voucher.id
                        ? '2px solid #1d4ed8'
                        : '1px solid #dbe3ee',
                    background:
                      selectedVoucher?.id === voucher.id ? '#f0f6ff' : '#ffffff'
                  }}
                >
                  <strong>{voucher.voucher_number}</strong>
                  <p style={{ color: '#64748b', marginTop: 6 }}>
                    Véhicule : {voucher.vehicle?.plate_number || '-'} · Chauffeur :{' '}
                    {voucher.driver?.full_name || '-'}
                  </p>
                  <p style={{ color: '#0f766e', fontWeight: 900, marginTop: 6 }}>
                    {voucher.approved_liters || 0} L approuvés
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="panel-title">Confirmer livraison</h3>
            <p className="panel-subtitle">
              Le bon doit être validé avant d’être servi.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <input
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Numéro du bon"
                className="form-input"
              />

              <button type="button" className="btn-primary" onClick={handleSearchVoucher}>
                <Search size={16} />
              </button>
            </div>

            {selectedVoucher && (
              <form onSubmit={handleDeliver} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: '#07172f',
                    color: '#ffffff'
                  }}
                >
                  <Fuel size={18} />
                  <strong style={{ display: 'block', marginTop: 8 }}>
                    {selectedVoucher.voucher_number}
                  </strong>
                  <p style={{ color: '#cbd5e1', marginTop: 6 }}>
                    {selectedVoucher.vehicle?.plate_number || '-'} ·{' '}
                    {selectedVoucher.driver?.full_name || '-'}
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
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="Prix du litre"
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

                <button className="btn-primary" disabled={loading}>
                  <CheckCircle2 size={17} />
                  {loading ? 'Validation...' : 'Confirmer livraison'}
                </button>
              </form>
            )}

            {error && (
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
      </main>
    </div>
  )
}