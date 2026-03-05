import { Link } from 'react-router-dom';
import './Header.css';

export default function Header({ breadcrumbs = [], title = '' }) {
  return (
    <header className="app-header">
      <div className="header-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {crumb.path ? (
              <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
            ) : (
              <span className="breadcrumb-current">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      {title && <h2 className="header-title">{title}</h2>}
    </header>
  );
}
