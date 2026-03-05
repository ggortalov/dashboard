export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 0',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--border-light)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
