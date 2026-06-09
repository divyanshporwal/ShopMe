import toast from 'react-hot-toast'

const closeButton = (toastId) => (
  <button
    onClick={() => toast.dismiss(toastId)}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '2px 0px 2px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      opacity: 0.45,
      flexShrink: 0,
      fontSize: '15px',
      lineHeight: '1',
      borderRadius: '4px',
      transition: 'opacity 0.15s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
    onMouseLeave={e => e.currentTarget.style.opacity = '0.45'}
    aria-label="Close"
  >
    ✕
  </button>
)

const toastRow = (message, toastId) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
  }}>
    <span>{message}</span>
    {closeButton(toastId)}
  </div>
)

export const showToast = {
  success: (message, options = {}) =>
    toast.success(
      (t) => toastRow(message, t.id),
      { ...options }
    ),

  error: (message, options = {}) =>
    toast.error(
      (t) => toastRow(message, t.id),
      { ...options }
    ),

  loading: (message, options = {}) =>
    toast.loading(
      (t) => toastRow(message, t.id),
      { ...options }
    ),
}

export default showToast
