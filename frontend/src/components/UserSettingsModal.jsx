import { useState, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  SOUND_OPTIONS,
  SOUND_CATEGORIES,
  getSoundEnabled,
  setSoundEnabled,
  getSoundChoice,
  setSoundChoice,
  previewSound,
} from '../services/soundService';
import './UserSettingsModal.css';

const API_BASE = 'http://localhost:5001';

export default function UserSettingsModal({ isOpen, onClose }) {
  const { user, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [enabled, setEnabled] = useState(getSoundEnabled);
  const [choice, setChoice] = useState(getSoundChoice);
  const [playingSound, setPlayingSound] = useState(null);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  };

  const handlePick = (name) => {
    setChoice(name);
    setSoundChoice(name);
  };

  const handlePreview = (name, e) => {
    e.stopPropagation();
    previewSound(name);
    setPlayingSound(name);
    setTimeout(() => setPlayingSound(null), 600);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await authService.uploadAvatar(file);
      updateAvatar(data.avatar);
    } catch {
      // silently fail
    }
    e.target.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings">
      <div className="user-settings">
        {/* ── Profile Section ── */}
        <div className="us-section">
          <div className="us-profile">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div className="us-avatar-wrapper" onClick={handleAvatarClick}>
              {user?.avatar ? (
                <img
                  src={`${API_BASE}${user.avatar}`}
                  alt="Avatar"
                  className="us-avatar-img"
                />
              ) : (
                <span className="us-avatar-badge">
                  {user?.username?.slice(0, 2).toUpperCase() || 'SG'}
                </span>
              )}
              <div className="us-avatar-overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <div className="us-profile-info">
              <span className="us-profile-name">{user?.username}</span>
              <span className="us-profile-email">{user?.email || 'No email set'}</span>
              <button className="us-avatar-change-btn" onClick={handleAvatarClick}>Change avatar</button>
            </div>
          </div>
        </div>

        {/* ── Sound Section ── */}
        <div className="us-section">
          <div className="us-section-header">
            <div className="us-section-title-row">
              <svg className="us-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span className="us-section-title">Notification Sound</span>
            </div>
            <button
              className={`us-toggle ${enabled ? 'us-toggle--on' : ''}`}
              onClick={handleToggle}
              role="switch"
              aria-checked={enabled}
            >
              <span className="us-toggle-thumb" />
            </button>
          </div>

          <div className={`us-sound-grid ${!enabled ? 'us-sound-grid--disabled' : ''}`}>
            {SOUND_CATEGORIES.map((cat) => (
              <div key={cat} className="us-sound-category">
                <span className="us-category-label">{cat}</span>
                <div className="us-category-sounds">
                  {SOUND_OPTIONS.filter((s) => s.category === cat).map((opt) => (
                    <button
                      key={opt.name}
                      className={`us-sound-chip ${choice === opt.name ? 'us-sound-chip--active' : ''} ${playingSound === opt.name ? 'us-sound-chip--playing' : ''}`}
                      onClick={() => enabled && handlePick(opt.name)}
                      disabled={!enabled}
                      title={opt.description}
                    >
                      <span className="us-chip-name">{opt.name}</span>
                      <button
                        className="us-chip-play"
                        onClick={(e) => handlePreview(opt.name, e)}
                        disabled={!enabled}
                        aria-label={`Preview ${opt.name}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
