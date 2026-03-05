import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import projectService from '../services/projectService';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectsOpen, setProjectsOpen] = useState(true);

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(() => {});
  }, []);

  const refreshProjects = () => {
    projectService.getAll().then(setProjects).catch(() => {});
  };

  // Expose refresh to window for cross-component updates
  useEffect(() => {
    window.__refreshSidebarProjects = refreshProjects;
    return () => { delete window.__refreshSidebarProjects; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">StyleGuard</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>

        <div className="sidebar-section">
          <button className="sidebar-section-toggle" onClick={() => setProjectsOpen(!projectsOpen)}>
            <svg className={`sidebar-icon sidebar-chevron ${projectsOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Projects
          </button>
          {projectsOpen && (
            <div className="sidebar-submenu">
              {projects.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`}
                >
                  {p.name}
                </NavLink>
              ))}
              {projects.length === 0 && (
                <span className="sidebar-empty">No projects yet</span>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <svg className="sidebar-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span className="sidebar-username">{user?.username}</span>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
