import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  Fuel,
  LogOut,
  ShieldCheck,
  Truck,
  Users
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { hasRole } from '../utils/roles'

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('fuel_user') || '{}')

  function logout() {
    localStorage.removeItem('fuel_token')
    localStorage.removeItem('fuel_user')
    window.location.href = '/login'
  }

  return (
    <aside
      style={{
        width: 282,
        minHeight: '100vh',
        padding: 20,
        background: '#07172f',
        color: '#ffffff',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0
      }}
    >
      <div>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ffffff',
                color: '#07172f',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Fuel size={24} />
            </div>

            <div>
              <h2 style={{ fontSize: 19, letterSpacing: '-0.03em' }}>
                Fuel Enterprise
              </h2>
              <p style={{ color: '#93a4bd', fontSize: 12 }}>
                Contrôle carburant
              </p>
            </div>
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
            <SidebarItem to="/" icon={<BarChart3 size={18} />} label="Vue générale" />
          )}

          {hasRole('super_admin', 'direction') && (
            <SidebarItem to="/divisions" icon={<Building2 size={18} />} label="Divisions" />
          )}

          {hasRole('super_admin', 'direction', 'chef_division') && (
            <SidebarItem to="/vehicles" icon={<Truck size={18} />} label="Véhicules" />
          )}

          {hasRole('super_admin', 'direction', 'chef_division') && (
            <SidebarItem to="/vehicle-history" icon={<Truck size={18} />} label="Historique véhicule" />
          )}

          {hasRole('super_admin', 'direction', 'chef_division') && (
            <SidebarItem to="/users" icon={<Users size={18} />} label="Utilisateurs" />
          )}

          {hasRole('super_admin', 'direction', 'chef_division') && (
            <SidebarItem to="/vouchers" icon={<FileText size={18} />} label="Bons carburant" />
          )}

          {hasRole('super_admin', 'direction', 'pompiste') && (
            <SidebarItem to="/pump" icon={<Fuel size={18} />} label="Pompiste" />
          )}

          {hasRole('super_admin', 'direction') && (
            <SidebarItem to="/reports" icon={<ShieldCheck size={18} />} label="Rapports" />
          )}

          {hasRole('super_admin', 'direction') && (
            <SidebarItem to="/analytics" icon={<Activity size={18} />} label="Analytics" />
          )}

          {hasRole('super_admin', 'direction') && (
            <SidebarItem to="/monthly-closing" icon={<CalendarCheck size={18} />} label="Clôture mensuelle" />
          )}
        </nav>
      </div>

      <button
        onClick={logout}
        style={{
          width: '100%',
          minHeight: 42,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          color: '#ffffff',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          fontWeight: 800
        }}
      >
        <LogOut size={17} />
        Déconnexion
      </button>
    </aside>
  )
}

function SidebarItem({ icon, label, to }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
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

