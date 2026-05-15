import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fuel, ShieldCheck, FileText } from 'lucide-react'

import { loginUser } from '../api/api'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const data = await loginUser({ email, password })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    localStorage.setItem('fuel_token', data.token)
    localStorage.setItem('fuel_user', JSON.stringify(data.user))

    navigate('/')
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 70
            }}
          >
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: 24,
                background: '#ffffff',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <img
                src="/favicon.png"
                alt="Fuel Enterprise"
                style={{
                  width: 56,
                  height: 56,
                  objectFit: 'contain'
                }}
              />
            </div>

            <div>
              <h1
                style={{
                  fontSize: 28,
                  color: '#ffffff',
                  marginBottom: 6
                }}
              >
                Fuel Enterprise
              </h1>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 16
                }}
              >
                Plateforme de contrôle carburant
              </p>
            </div>
          </div>

          <p
            style={{
              color: '#bfdbfe',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}
          >
            Gestion industrielle • Traçabilité • Reporting
          </p>

          <h2
            style={{
              fontSize: 72,
              lineHeight: 1.02,
              color: '#ffffff',
              maxWidth: 720,
              marginBottom: 24,
              letterSpacing: '-0.05em'
            }}
          >
            Pilotez les bons carburant avec contrôle, preuves et visibilité.
          </h2>

          <p
            style={{
              color: '#cbd5e1',
              maxWidth: 650,
              fontSize: 18,
              lineHeight: 1.8
            }}
          >
            Une solution conçue pour les grandes structures : divisions,
            véhicules, chauffeurs, pompistes, clôture mensuelle et audit des
            opérations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16
          }}
        >
          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Bons numériques"
          />

          <FeatureCard
            icon={<Fuel size={24} />}
            title="Contrôle pompiste"
          />

          <FeatureCard
            icon={<FileText size={24} />}
            title="Rapports PDF"
          />
        </div>
      </section>

      <section className="login-form-section">
        <form onSubmit={handleLogin} className="login-card">
          <p className="page-eyebrow">Accès sécurisé</p>

          <h2
            style={{
              fontSize: 52,
              color: '#07172f',
              marginBottom: 14,
              letterSpacing: '-0.05em'
            }}
          >
            Connexion
          </h2>

          <p
            style={{
              color: '#64748b',
              marginBottom: 30,
              lineHeight: 1.7,
              fontSize: 16
            }}
          >
            Connecte-toi pour accéder au tableau de bord carburant.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 18
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              >
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-input"
                placeholder="admin@snpt.tg"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              >
                Mot de passe
              </label>

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: '#fee2e2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  fontSize: 14
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: 52,
                fontSize: 18
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <p
            style={{
              marginTop: 26,
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 14
            }}
          >
            Accès réservé aux utilisateurs autorisés.
          </p>
        </form>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title }) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.08)',
          display: 'grid',
          placeItems: 'center',
          marginBottom: 18
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: '#ffffff',
          fontSize: 18,
          lineHeight: 1.4
        }}
      >
        {title}
      </h3>
    </div>
  )
}