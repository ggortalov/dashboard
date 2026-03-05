import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import dashboardService from '../services/dashboardService';
import projectService from '../services/projectService';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './DashboardPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    dashboardService.getGlobal()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await projectService.create({ name: newName, description: newDesc });
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
    fetchData();
    if (window.__refreshSidebarProjects) window.__refreshSidebarProjects();
  };

  if (loading) return <><Header breadcrumbs={[{ label: 'Dashboard' }]} /><LoadingSpinner /></>;

  const stats = data?.global_stats || {};
  const chartData = {
    labels: ['Passed', 'Failed', 'Blocked', 'Retest', 'Untested'],
    datasets: [{
      data: [stats.Passed || 0, stats.Failed || 0, stats.Blocked || 0, stats.Retest || 0, stats.Untested || 0],
      backgroundColor: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9E9E9E'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      <div className="page-content">
        <div className="page-toolbar">
          <h2 className="page-heading">Dashboard</h2>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        </div>

        <div className="stats-grid">
          <StatsCard label="Projects" value={data?.totals?.projects || 0} color="var(--primary)" />
          <StatsCard label="Test Cases" value={data?.totals?.cases || 0} color="var(--text-primary)" />
          <StatsCard label="Test Runs" value={data?.totals?.runs || 0} color="var(--text-primary)" />
          <StatsCard label="Pass Rate" value={`${stats.pass_rate || 0}%`} color="var(--status-passed)" />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-projects-card">
            <h3>Projects</h3>
            {data?.projects?.length > 0 ? (
              <div className="project-list">
                {data.projects.map((p) => (
                  <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                    <div className="project-card-header">
                      <span className="project-card-name">{p.name}</span>
                      <span className="project-card-rate" style={{ color: p.stats.pass_rate >= 80 ? 'var(--status-passed)' : p.stats.pass_rate >= 50 ? 'var(--status-blocked)' : 'var(--status-failed)' }}>
                        {p.stats.pass_rate}%
                      </span>
                    </div>
                    <div className="project-card-meta">
                      {p.suite_count} suites &middot; {p.case_count} cases &middot; {p.run_count} runs
                    </div>
                    {p.stats.total > 0 && (
                      <div className="project-card-bar">
                        {['Passed', 'Failed', 'Blocked', 'Retest', 'Untested'].map((s) => (
                          p.stats[s] > 0 && (
                            <div
                              key={s}
                              className="bar-segment"
                              style={{
                                width: `${(p.stats[s] / p.stats.total) * 100}%`,
                                backgroundColor: `var(--status-${s.toLowerCase()})`,
                              }}
                              title={`${s}: ${p.stats[s]}`}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No projects yet. Create your first project to get started.</p>
            )}
          </div>
        </div>

        {data?.recent_runs?.length > 0 && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Recent Test Runs</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Project</th>
                  <th>Suite</th>
                  <th>Tests</th>
                  <th>Pass Rate</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_runs.map((run) => (
                  <tr key={run.id} className="clickable-row" onClick={() => navigate(`/runs/${run.id}`)}>
                    <td className="text-primary-bold">{run.name}</td>
                    <td>{run.project_name}</td>
                    <td>{run.suite_name}</td>
                    <td>{run.total_results}</td>
                    <td>
                      <span style={{ color: run.pass_rate >= 80 ? 'var(--status-passed)' : run.pass_rate >= 50 ? 'var(--status-blocked)' : 'var(--status-failed)', fontWeight: 600 }}>
                        {run.pass_rate}%
                      </span>
                    </td>
                    <td className="text-muted">{new Date(run.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreateProject} className="modal-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter project name"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
