import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import caseService from '../services/caseService';
import './TestCaseDetailPage.css';

export default function TestCaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [tc, setTc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.getById(caseId)
      .then(setTc)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <><Header breadcrumbs={[{ label: 'Dashboard', path: '/' }]} /><LoadingSpinner /></>;

  return (
    <div>
      <Header breadcrumbs={[
        { label: 'Dashboard', path: '/' },
        { label: `C${tc.id} - ${tc.title}` },
      ]} />
      <div className="page-content">
        <div className="card case-detail-card">
          <div className="case-detail-header">
            <h2>C{tc.id} - {tc.title}</h2>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>

          <div className="case-meta-grid">
            <div className="case-meta-item">
              <span className="meta-label">Section</span>
              <span className="meta-value">{tc.section_name}</span>
            </div>
            <div className="case-meta-item">
              <span className="meta-label">Type</span>
              <span className="meta-value">{tc.case_type}</span>
            </div>
            <div className="case-meta-item">
              <span className="meta-label">Priority</span>
              <span className="meta-value"><PriorityBadge priority={tc.priority} /></span>
            </div>
            <div className="case-meta-item">
              <span className="meta-label">Created</span>
              <span className="meta-value">{new Date(tc.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {tc.preconditions && (
            <div className="case-section">
              <h3>Preconditions</h3>
              <p>{tc.preconditions}</p>
            </div>
          )}

          {tc.steps && tc.steps.length > 0 && (
            <div className="case-section">
              <h3>Steps</h3>
              <table className="data-table steps-table">
                <thead>
                  <tr><th>#</th><th>Action</th><th>Expected Result</th></tr>
                </thead>
                <tbody>
                  {tc.steps.map((step, i) => (
                    <tr key={i}>
                      <td className="step-number">{i + 1}</td>
                      <td>{step.action}</td>
                      <td>{step.expected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tc.expected_result && (
            <div className="case-section">
              <h3>Expected Result</h3>
              <p>{tc.expected_result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
