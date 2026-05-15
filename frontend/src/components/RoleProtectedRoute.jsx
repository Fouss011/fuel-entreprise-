import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/roles'

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('fuel_token')
  const user = getCurrentUser()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'pompiste') {
      return <Navigate to="/pump" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}