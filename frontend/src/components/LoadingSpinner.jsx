export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 0',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-light)',
        borderTopColor: 'var(--sidebar-bg)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <span style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}>Loading...</span>
    </div>
  );
}
