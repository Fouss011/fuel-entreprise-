export default function EntityCard({
  title,
  subtitle,
  badge = 'SUPPRIMER',
  badgeTone = 'danger',
  items = [],
  onAction
}) {
  const tones = {
    danger: {
      bg: '#fee2e2',
      color: '#b91c1c'
    },
    success: {
      bg: '#e6f6f3',
      color: '#0f766e'
    },
    blue: {
      bg: '#e8f0ff',
      color: '#1d4ed8'
    }
  }

  const tone = tones[badgeTone] || tones.danger

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 16,
        padding: 18,
        border: '1px solid #dbe3ee',
        background: '#ffffff',
        boxShadow: '0 4px 12px rgba(15,23,42,0.04)',
        color: '#0f172a'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
          alignItems: 'center',
          marginBottom: 14
        }}
      >
        <div>
          <strong
            style={{
              color: '#07172f',
              fontSize: 17,
              fontWeight: 900
            }}
          >
            {title}
          </strong>

          {subtitle && (
            <p
              style={{
                color: '#64748b',
                marginTop: 4,
                fontSize: 13
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              padding: '7px 11px',
              borderRadius: 999,
              background: tone.bg,
              color: tone.color,
              border: 'none',
              fontSize: 12,
              fontWeight: 900
            }}
          >
            {badge}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10
        }}
      >
        {items.map((item) => (
          <Info key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      <p
        style={{
          color: '#64748b',
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 4
        }}
      >
        {label}
      </p>

      <strong
        style={{
          color: '#07172f',
          fontSize: 14
        }}
      >
        {value || '-'}
      </strong>
    </div>
  )
}