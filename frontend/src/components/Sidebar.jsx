import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  Fuel,
  Layers,
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  Users,
  X
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { hasRole } from '../utils/roles'

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('fuel_user') || '{}')
  const [open, setOpen] = useState(false)

  function logout() {
    localStorage.removeItem('fuel_token')
    localStorage.removeItem('fuel_user')
    window.location.href = '/login'
  }

  return (
    <>
      <div className="mobile-nav">
        <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
  <Menu size={24} />
</button>

<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <img
    src="/favicon.png"
    alt="Fuel Manager"
    style={{
      width: 38,
      height: 38,
      borderRadius: 10,
      objectFit: 'contain',
      background: '#ffffff'
    }}
  />

  <div>
    <strong>Fuel manager</strong>
    <p style={{ color: '#94a3b8', fontSize: 12 }}>
      Contrôle carburant
    </p>
  </div>
</div>
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar-mobile-open' : ''}`}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src="/favicon.png"
                  alt="Fuel Manager"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    objectFit: 'contain',
                    background: '#ffffff'
                  }}
                />

                <div>
                  <h2 style={{ fontSize: 19, letterSpacing: '-0.03em' }}>
                    Fuel Manager
                  </h2>
                  <p style={{ color: '#93a4bd', fontSize: 12 }}>
                    Contrôle carburant
                  </p>
                </div>
              </div>

              <button className="mobile-close-btn" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <p style={{ color: '#93a4bd', fontSize: 12, marginBottom: 5 }}>
                Session active
              </p>

              <strong style={{ fontSize: 14 }}>
                {user.fullName || 'Utilisateur'}
              </strong>

              <p style={{ color: '#bfdbfe', fontSize: 12, marginTop: 5 }}>
                {formatRole(user.role)}
              </p>
            </div>
          </div>

          <nav style={{ display: 'grid', gap: 6 }}>
  {hasRole('super_admin', 'direction', 'chef_division') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/"
      icon={<BarChart3 size={18} />}
      label="Vue générale"
    />
  )}

  {hasRole('super_admin') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/structures"
      icon={<Layers size={18} />}
      label="Structures"
    />
  )}

  {hasRole('super_admin', 'direction', 'chef_division') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/users"
      icon={<Users size={18} />}
      label="Utilisateurs"
    />
  )}

  {hasRole('super_admin', 'direction') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/divisions"
      icon={<Building2 size={18} />}
      label="Divisions"
    />
  )}

  {hasRole('super_admin', 'direction', 'chef_division') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/vehicles"
      icon={<Truck size={18} />}
      label="Véhicules"
    />
  )}

  {hasRole('super_admin', 'direction', 'chef_division') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/vouchers"
      icon={<FileText size={18} />}
      label="Bons carburant"
    />
  )}

  {hasRole('super_admin', 'direction', 'pompiste') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/pump"
      icon={<Fuel size={18} />}
      label="Pompiste"
    />
  )}

  {hasRole('super_admin', 'direction') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/reports"
      icon={<ShieldCheck size={18} />}
      label="Rapports"
    />
  )}

  {hasRole('super_admin', 'direction', 'chef_division') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/vehicle-history"
      icon={<Truck size={18} />}
      label="Historique véhicule"
    />
  )}

  {hasRole('super_admin', 'direction') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/analytics"
      icon={<Activity size={18} />}
      label="Analytics"
    />
  )}

  {hasRole('super_admin', 'direction') && (
    <SidebarItem
      close={() => setOpen(false)}
      to="/monthly-closing"
      icon={<CalendarCheck size={18} />}
      label="Clôture mensuelle"
    />
  )}
</nav>
        </div>

        <button onClick={logout} className="sidebar-logout">
          <LogOut size={17} />
          Déconnexion
        </button>
      </aside>
    </>
  )
}

function SidebarItem({ icon, label, to, close }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
      onClick={close}
      style={{
        minHeight: 42,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 12px',
        borderRadius: 11,
        color: active ? '#07172f' : '#d7e2f1',
        background: active ? '#ffffff' : 'transparent',
        border: active
          ? '1px solid rgba(255,255,255,0.9)'
          : '1px solid transparent',
        fontWeight: active ? 900 : 700,
        fontSize: 14
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function formatRole(role) {
  const labels = {
    super_admin: 'P1 · Administration générale',
    direction: 'P1 · Direction',
    chef_division: 'P2 · Responsable division',
    pompiste: 'P3 · Pompiste',
    chauffeur: 'Chauffeur',
    comptabilite: 'Comptabilité / Audit'
  }

  return labels[role] || role || 'Utilisateur'
}