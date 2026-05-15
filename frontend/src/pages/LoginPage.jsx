import { useState } from 'react'
import { loginUser } from '../api/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const data = await loginUser({ email, password })

      if (data.error) {
        setError(data.error)
        return
      }

      localStorage.setItem('fuel_token', data.token)
      localStorage.setItem('fuel_user', JSON.stringify(data.user))

      window.location.href = '/'
    } catch {
      setError('Erreur connexion')
    } finally {
      setLoading(false)
    }
  }

  const mobile = window.innerWidth <= 900

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1.1fr 0.9fr',
        background: '#f3f6fb'
      }}
    >
      {!mobile && (
        <section
          style={{
            padding: 54,
            background: '#07172f',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 80
              }}
            >
              <img
                src="/favicon.png"
                alt="Fuel Manager"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  objectFit: 'contain',
                  background: '#ffffff',
                  padding: 6
                }}
              />

              <div>
                <h1 style={{ fontSize: 26, letterSpacing: '-0.04em' }}>
                  Fuel Manager
                </h1>
                <p style={{ color: '#93a4bd', marginTop: 4 }}>
                  Plateforme de contrôle carburant
                </p>
              </div>
            </div>

            <h2
              style={{
                fontSize: 46,
                lineHeight: 1.08,
                letterSpacing: '-0.05em',
                maxWidth: 660,
                marginBottom: 22
              }}
            >
              Pilotez les bons carburant avec contrôle et visibilité.
            </h2>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: 17,
                lineHeight: 1.7,
                maxWidth: 640
              }}
            >
              Une solution conçue pour les grandes structures.
            </p>
          </div>
        </section>
      )}

      <section
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: mobile ? 18 : 34
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: 430,
            background: '#ffffff',
            border: '1px solid #dbe3ee',
            borderRadius: mobile ? 16 : 20,
            padding: mobile ? 22 : 30,
            boxShadow: '0 16px 40px rgba(15,23,42,0.08)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img
              src="/favicon.png"
              alt="Fuel Manager"
              style={{
                width: 78,
                height: 78,
                borderRadius: 20,
                objectFit: 'contain',
                background: '#ffffff',
                padding: 8,
                marginBottom: 14,
                boxShadow: '0 10px 24px rgba(15,23,42,0.12)'
              }}
            />

            <h2
              style={{
                color: '#07172f',
                fontSize: mobile ? 26 : 30,
                marginBottom: 8
              }}
            >
              Fuel Manager
            </h2>

            <p style={{ color: '#64748b' }}>
              Connexion à la plateforme SNPT
            </p>
          </div>

          <label style={labelStyle}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
            className="form-input"
            style={{ marginBottom: 16 }}
          />

          <label style={labelStyle}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            className="form-input"
            style={{ marginBottom: 18 }}
          />

          {error && (
            <p
              style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                fontWeight: 700
              }}
            >
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: 48
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </section>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  color: '#07172f',
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 7
}