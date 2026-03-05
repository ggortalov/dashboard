import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm'}>
      <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        {message || 'Are you sure you want to proceed?'}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}
