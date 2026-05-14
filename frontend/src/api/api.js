const API_URL = 'http://localhost:4000/api'

function authHeaders() {
  const token = localStorage.getItem('fuel_token')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export async function loginUser(payload) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function getDashboard(token) {
  const response = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.json()
}

export async function getDivisions() {
  const response = await fetch(`${API_URL}/divisions`, {
    headers: authHeaders()
  })

  return response.json()
}

export async function createDivision(payload) {
  const response = await fetch(`${API_URL}/divisions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function getVehicles() {
  const response = await fetch(`${API_URL}/vehicles`, {
    headers: authHeaders()
  })

  return response.json()
}

export async function createVehicle(payload) {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: authHeaders()
  })

  return response.json()
}

export async function createUser(payload) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function getFuelVouchers() {
  const response = await fetch(`${API_URL}/fuel-vouchers`, {
    headers: authHeaders()
  })

  return response.json()
}

export async function createFuelVoucher(payload) {
  const response = await fetch(`${API_URL}/fuel-vouchers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function approveFuelVoucher(id, payload) {
  const response = await fetch(`${API_URL}/fuel-vouchers/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })

  return response.json()
}

export async function rejectFuelVoucher(id) {
  const response = await fetch(`${API_URL}/fuel-vouchers/${id}/reject`, {
    method: 'PATCH',
    headers: authHeaders()
  })

  return response.json()
}

export async function getApprovedVouchers() {
  const response = await fetch(
    `${API_URL}/fuel-deliveries/approved-vouchers`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function deliverFuel(payload) {
  const response = await fetch(
    `${API_URL}/fuel-deliveries/deliver`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }
  )

  return response.json()
}

export async function getDeliveriesReport() {
  const response = await fetch(
    `${API_URL}/reports/deliveries`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function getAnalytics() {
  const response = await fetch(
    `${API_URL}/analytics`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function getMonthlyClosing(month) {
  const response = await fetch(
    `${API_URL}/monthly-closing?month=${month}`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function getVehicleHistory(vehicleId, month = '') {
  const params = new URLSearchParams()
  params.set('vehicleId', vehicleId)

  if (month) {
    params.set('month', month)
  }

  const response = await fetch(
    `${API_URL}/vehicle-history?${params.toString()}`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function searchVoucherByCode(code) {
  const response = await fetch(
    `${API_URL}/fuel-deliveries/search?code=${encodeURIComponent(code)}`,
    {
      headers: authHeaders()
    }
  )

  return response.json()
}

export async function deleteDivision(id) {
  const response = await fetch(`${API_URL}/divisions/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })

  return response.json()
}

export async function deleteVehicle(id) {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })

  return response.json()
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })

  return response.json()
}

export async function deleteFuelVoucher(id) {
  const response = await fetch(`${API_URL}/fuel-vouchers/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })

  return response.json()
}