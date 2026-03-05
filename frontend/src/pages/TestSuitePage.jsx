import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import SectionTree from '../components/SectionTree';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import suiteService from '../services/suiteService';
import sectionService from '../services/sectionService';
import caseService from '../services/caseService';
import projectService from '../services/projectService';
import './TestSuitePage.css';

export default function TestSuitePage() {
  const { projectId, suiteId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [suite, setSuite] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionParentId, setSectionParentId] = useState(null);

  // Delete confirm
  const [deleteSection, setDeleteSection] = useState(null);
  const [deleteCase, setDeleteCase] = useState(null);

  const fetchData = async () => {
    try {
      const [p, s, secs] = await Promise.all([
        projectService.getById(projectId),
        suiteService.getById(suiteId),
        sectionService.getBySuite(suiteId),
      ]);
      setProject(p);
      setSuite(s);
      setSections(secs);
    } catch {
      navigate(`/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [suiteId]);

  useEffect(() => {
    if (selectedSection) {
      caseService.getBySection(selectedSection).then(setCases).catch(() => setCases([]));
    } else {
      // Show all cases for suite
      caseService.getBySuite(suiteId).then(setCases).catch(() => setCases([]));
    }
  }, [selectedSection, suiteId]);

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (editSection) {
      await sectionService.update(editSection.id, { name: sectionName });
    } else {
      await sectionService.create(suiteId, { name: sectionName, parent_id: sectionParentId });
    }
    setShowSectionModal(false);
    setSectionName('');
    setEditSection(null);
    setSectionParentId(null);
    fetchData();
  };

  const handleDeleteSection = async () => {
    if (deleteSection) {
      await sectionService.delete(deleteSection.id);
      setDeleteSection(null);
      if (selectedSection === deleteSection.id) setSelectedSection(null);
      fetchData();
    }
  };

  const handleDeleteCase = async () => {
    if (deleteCase) {
      await caseService.delete(deleteCase.id);
      setDeleteCase(null);
      // Refresh cases
      if (selectedSection) {
        caseService.getBySection(selectedSection).then(setCases);
      } else {
        caseService.getBySuite(suiteId).then(setCases);
      }
      fetchData();
    }
  };

  if (loading) return <><Header breadcrumbs={[{ label: 'Dashboard', path: '/' }]} /><LoadingSpinner /></>;

  return (
    <div>
      <Header breadcrumbs={[
        { label: 'Dashboard', path: '/' },
        { label: project?.name, path: `/projects/${projectId}` },
        { label: suite?.name },
      ]} />
      <div className="page-content">
        <div className="page-toolbar">
          <h2 className="page-heading">{suite?.name}</h2>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={() => {
              setEditSection(null);
              setSectionName('');
              setSectionParentId(null);
              setShowSectionModal(true);
            }}>+ Section</button>
            <button className="btn btn-primary" onClick={() => {
              if (selectedSection) {
                navigate(`/projects/${projectId}/suites/${suiteId}/cases/new?sectionId=${selectedSection}`);
              } else if (sections.length > 0) {
                navigate(`/projects/${projectId}/suites/${suiteId}/cases/new?sectionId=${sections[0].id}`);
              }
            }} disabled={sections.length === 0}>+ Test Case</button>
          </div>
        </div>

        <div className="suite-layout">
          <div className="suite-sidebar">
            <div className="suite-sidebar-header">
              <span className="suite-sidebar-title">Sections</span>
              <button
                className={`suite-sidebar-all ${!selectedSection ? 'active' : ''}`}
                onClick={() => setSelectedSection(null)}
              >
                All
              </button>
            </div>
            <SectionTree
              sections={sections}
              selectedId={selectedSection}
              onSelect={(id) => setSelectedSection(id)}
              onAdd={(parentId) => {
                setEditSection(null);
                setSectionName('');
                setSectionParentId(parentId);
                setShowSectionModal(true);
              }}
              onEdit={(section) => {
                setEditSection(section);
                setSectionName(section.name);
                setShowSectionModal(true);
              }}
              onDelete={(section) => setDeleteSection(section)}
            />
          </div>

          <div className="suite-content">
            {cases.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    {!selectedSection && <th>Section</th>}
                    <th>Type</th>
                    <th>Priority</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td className="text-muted">C{c.id}</td>
                      <td>
                        <Link to={`/cases/${c.id}`} className="table-link">{c.title}</Link>
                      </td>
                      {!selectedSection && <td className="text-muted">{c.section_name}</td>}
                      <td className="text-muted">{c.case_type}</td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td className="actions-cell">
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/projects/${projectId}/suites/${suiteId}/cases/${c.id}/edit`)}>&#9998;</button>
                        <button className="btn-icon danger" title="Delete" onClick={() => setDeleteCase(c)}>&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No test cases {selectedSection ? 'in this section' : 'yet'}.</p>
                <button className="btn btn-primary" onClick={() => {
                  const sid = selectedSection || (sections.length > 0 ? sections[0].id : null);
                  if (sid) navigate(`/projects/${projectId}/suites/${suiteId}/cases/new?sectionId=${sid}`);
                }} disabled={sections.length === 0}>Create Test Case</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)} title={editSection ? 'Edit Section' : 'Add Section'}>
        <form onSubmit={handleSaveSection} className="modal-form">
          <div className="form-group">
            <label>Section Name</label>
            <input type="text" value={sectionName} onChange={(e) => setSectionName(e.target.value)} required autoFocus placeholder="Enter section name" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSectionModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editSection ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteSection}
        onClose={() => setDeleteSection(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={`Delete "${deleteSection?.name}"? All child sections and test cases will be removed.`}
      />

      <ConfirmDialog
        isOpen={!!deleteCase}
        onClose={() => setDeleteCase(null)}
        onConfirm={handleDeleteCase}
        title="Delete Test Case"
        message={`Delete test case "${deleteCase?.title}"?`}
      />
    </div>
  );
}
