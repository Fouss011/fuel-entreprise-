import { ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

export default function SearchSelect({
  label,
  placeholder = 'Sélectionner...',
  items = [],
  value,
  onChange,
  getLabel,
  getSubLabel
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef(null)

  const selectedItem = items.find((item) => item.id === value)

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()

    if (!open) return []

    if (!q) return items.slice(0, 8)

    return items
      .filter((item) => {
        const main = getLabel(item)?.toLowerCase() || ''
        const sub = getSubLabel?.(item)?.toLowerCase() || ''
        return main.includes(q) || sub.includes(q)
      })
      .slice(0, 8)
  }, [items, query, open, getLabel, getSubLabel])

  function handleFocus() {
    setOpen(true)
    setQuery('')
  }

  function handleSelect(item) {
    onChange(item.id)
    setQuery('')
    setOpen(false)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setQuery('')
    }, 150)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'grid', gap: 8 }}>
      {label && (
        <label style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 14 }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          value={open ? query : selectedItem ? getLabel(selectedItem) : ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          className="form-input"
          style={{ paddingRight: 42 }}
        />

        <ChevronDown
          size={18}
          onMouseDown={(e) => {
            e.preventDefault()
            setOpen((prev) => !prev)
          }}
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: label ? 78 : 50,
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: 260,
            overflowY: 'auto',
            padding: 8,
            borderRadius: 16,
            border: '1px solid rgba(148, 163, 184, 0.22)',
            background: '#081426',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
          }}
        >
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 12,
                borderRadius: 12,
                marginBottom: 6,
                border:
                  item.id === value
                    ? '1px solid rgba(56, 189, 248, 0.75)'
                    : '1px solid transparent',
                background:
                  item.id === value
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'transparent',
                color: 'white'
              }}
            >
              <strong>{getLabel(item)}</strong>
              {getSubLabel && (
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                  {getSubLabel(item)}
                </div>
              )}
            </button>
          ))}

          {filteredItems.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 14, padding: 12 }}>
              Aucun résultat trouvé.
            </p>
          )}
        </div>
      )}
    </div>
  )
}