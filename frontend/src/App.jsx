import { Routes, Route } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DivisionsPage from './pages/DivisionsPage'
import VehiclesPage from './pages/VehiclesPage'
import UsersPage from './pages/UsersPage'
import VouchersPage from './pages/VouchersPage'
import PumpPage from './pages/PumpPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import MonthlyClosingPage from './pages/MonthlyClosingPage'
import VehicleHistoryPage from './pages/VehicleHistoryPage'
import StructuresPage from './pages/StructuresPage'

import RoleProtectedRoute from './components/RoleProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction',
              'chef_division'
            ]}
          >
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/divisions"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction'
            ]}
          >
            <DivisionsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/vehicles"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction',
              'chef_division'
            ]}
          >
            <VehiclesPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction',
              'chef_division'
            ]}
          >
            <UsersPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/vouchers"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction',
              'chef_division'
            ]}
          >
            <VouchersPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/pump"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction',
              'pompiste'
            ]}
          >
            <PumpPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <RoleProtectedRoute
            allowedRoles={[
              'super_admin',
              'direction'
            ]}
          >
            <ReportsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
  path="/analytics"
  element={
    <RoleProtectedRoute
      allowedRoles={[
        'super_admin',
        'direction'
      ]}
    >
      <AnalyticsPage />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/monthly-closing"
  element={
    <RoleProtectedRoute
      allowedRoles={[
        'super_admin',
        'direction'
      ]}
    >
      <MonthlyClosingPage />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/vehicle-history"
  element={
    <RoleProtectedRoute
      allowedRoles={[
        'super_admin',
        'direction',
        'chef_division'
      ]}
    >
      <VehicleHistoryPage />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/structures"
  element={
    <RoleProtectedRoute
      allowedRoles={[
        'super_admin'
      ]}
    >
      <StructuresPage />
    </RoleProtectedRoute>
  }
/>
    </Routes>
  )
}