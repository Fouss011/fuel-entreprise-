import { Navigate } from 'react-router-dom'

import {
  getCurrentUser
} from '../utils/roles'

export default function RoleProtectedRoute({
  children,
  allowedRoles = []
}) {
  const token = localStorage.getItem('fuel_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />
  }

  return children
}