export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem('fuel_user') || '{}'
  )
}

export function hasRole(...roles) {
  const user = getCurrentUser()

  return roles.includes(user.role)
}