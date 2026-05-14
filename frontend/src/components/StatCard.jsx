export default function StatCard({ title, value, icon, tone = 'blue', subtitle }) {
  const tones = {
    blue: {
      bg: '#e8f0ff',
      color: '#1d4ed8'
    },
    green: {
      bg: '#e6f6f3',
      color: '#0f766e'
    },
    amber: {
      bg: '#fff4df',
      color: '#b45309'
    },
    red: {
      bg: '#fee2e2',
      color: '#b91c1c'
    }
  }

  const toneStyle = tones[tone] || tones.blue

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: '#ffffff',
        border: '1px solid #dbe3ee',
        boxShadow: '0 6px 18px rgba(15,23,42,0.06)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
          alignItems: 'flex-start'
        }}
      >
        <div>
          <p
            style={{
              color: '#64748b',
              fontWeight: 800,
              fontSize: 13,
              marginBottom: 8
            }}
          >
            {title}
          </p>

          <h2
            style={{
              color: '#07172f',
              fontSize: 30,
              letterSpacing: '-0.05em',
              marginBottom: 5
            }}
          >
            {value}
          </h2>

          {subtitle && (
            <p
              style={{
                color: '#64748b',
                fontSize: 13,
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            minWidth: 42,
            height: 42,
            borderRadius: 12,
            background: toneStyle.bg,
            color: toneStyle.color,
            display: 'grid',
            placeItems: 'center'
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}