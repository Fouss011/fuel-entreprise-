import { useState } from 'react'
import { Fuel, ShieldCheck } from 'lucide-react'
import { loginUser } from '../api/api'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@snpt.tg')
  const [password, setPassword] = useState('admin123')
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        background: '#f3f6fb'
      }}
    >
      <section
        style={{
          padding: 54,
          background: '#07172f',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
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
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#ffffff',
                color: '#07172f',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Fuel size={26} />
            </div>

            <div>
              <h1 style={{ fontSize: 24, letterSpacing: '-0.04em' }}>
                Fuel Enterprise
              </h1>
              <p style={{ color: '#93a4bd', marginTop: 4 }}>
                Plateforme de contrôle carburant
              </p>
            </div>
          </div>

          <p
            style={{
              color: '#bfdbfe',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 12,
              marginBottom: 18
            }}
          >
            Gestion industrielle · Traçabilité · Reporting
          </p>

          <h2
            style={{
              fontSize: 46,
              lineHeight: 1.06,
              letterSpacing: '-0.06em',
              maxWidth: 660,
              marginBottom: 22
            }}
          >
            Pilotez les bons carburant avec contrôle, preuves et visibilité.
          </h2>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 640
            }}
          >
            Une solution conçue pour les grandes structures : divisions,
            véhicules, chauffeurs, pompistes, clôture mensuelle et audit des opérations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14
          }}
        >
          {['Bons numériques', 'Contrôle pompiste', 'Rapports PDF'].map((item) => (
            <div
              key={item}
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <ShieldCheck size={18} />
              <p style={{ marginTop: 10, fontWeight: 800 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: 34
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: 430,
            background: '#ffffff',
            border: '1px solid #dbe3ee',
            borderRadius: 20,
            padding: 30,
            boxShadow: '0 16px 40px rgba(15,23,42,0.08)'
          }}
        >
          <p
            style={{
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10
            }}
          >
            Accès sécurisé
          </p>

          <h2
            style={{
              color: '#07172f',
              fontSize: 28,
              letterSpacing: '-0.04em',
              marginBottom: 8
            }}
          >
            Connexion
          </h2>

          <p
            style={{
              color: '#64748b',
              lineHeight: 1.5,
              marginBottom: 24
            }}
          >
            Connecte-toi pour accéder au tableau de bord carburant.
          </p>

          <label style={labelStyle}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="form-input"
            style={{ marginBottom: 16 }}
          />

          <label style={labelStyle}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
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
              minHeight: 46
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p
            style={{
              color: '#94a3b8',
              fontSize: 12,
              marginTop: 18,
              textAlign: 'center'
            }}
          >
            Accès réservé aux utilisateurs autorisés.
          </p>
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